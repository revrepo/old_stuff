
#ifndef WIN32
    #include <unistd.h>
    #include <cstdlib>
    #include <cstring>
    #include <netdb.h>
    #include <sys/types.h> 
    #include <sys/stat.h>
    #include <algorithm>
#else
    #include <winsock2.h>
    #include <ws2tcpip.h>
    #include <wspiapi.h>
#endif
#include <stdio.h>
#include <iostream>
#include <fstream>
#include <udt.h>
#include <config.h>
#include <unistd.h>
#include "cc.h"
#include "test_util.h"

using namespace std;

#ifndef WIN32
void* serverThreadEntry(void*);
void* start_rmp_server(void *in_port);
#else
DWORD WINAPI serverThreadEntry(LPVOID);
#endif

int RMP_CONFIG::udt_enable_log = 0;
int RMP_CONFIG::rmp_enable_cid = 0;
std::ofstream RMP_CONFIG::rmp_logfile;
int RMP_CONFIG::rmp_initial_cwnd;


static void usage(void)
{
    cout << "Ma = Mandatory and Op = Optional" << endl;
    cout << "./rmpserver -h <[Op] HELP>  --port <[Op] port number> ";
    cout <<  "--log <[Op] 1/0> --cid <[Op] 1/0> --icwnd <[Ma] Initial Congestion Window> " << endl;
    exit(EXIT_SUCCESS);
}

static char* getCmdOption(char ** begin, char ** end, const std::string & option)
{
    char ** itr = std::find(begin, end, option);
    if (itr != end && ++itr != end)
    {
        return *itr;
    }
    return NULL;
}

static bool cmdOptionExists(char** begin, char** end, const std::string& option)
{
    return std::find(begin, end, option) != end;
}

int main(int argc, char* argv[])
{
    int port = 9999;
    char *value;

    if(cmdOptionExists(argv, argv+argc, "-h"))
        usage();

    value = getCmdOption(argv, argv + argc, "--port");
    if (value)
        port = atoi(value);

    value = getCmdOption(argv, argv + argc, "--log");
    if (value != NULL)
        RMP_CONFIG::udt_enable_log = atoi(value);

    value = getCmdOption(argv, argv + argc, "--cid");
    if (value != NULL)
        RMP_CONFIG::rmp_enable_cid = atoi(value);

    value = getCmdOption(argv, argv + argc, "--icwnd");
    if (value != NULL)
        RMP_CONFIG::rmp_initial_cwnd = atoi(value);
    else
        usage();

   /* Automatically start up and clean up UDT module. */
   UDTUpDown _udt_;

   RMP_CONFIG::rmp_logfile.open("/opt/revsw-rmpserver/log/rmpserver.log", std::ofstream::out | std::ofstream::app);

   /* Starting 2 RMP servers. One will be without TLS and one with TLS) */

   pthread_t rcvthread[2];

   for (int i = 0; i < 2; i++) {
       int *p = new(int);
       *p = port;
       pthread_create(&rcvthread[i], NULL, start_rmp_server, p);
       RmpCout() << "Starting thread: " << &rcvthread[i] << "\n";
       port++;
   }

   for (int i = 0; i < 2; i++)
          pthread_join(rcvthread[i], NULL);

   RMP_CONFIG::rmp_logfile.close();

   return 0;
}

void* start_rmp_server(void *in_port)
{   
    int int_port = *((int*) in_port), varnish_port;
    delete (int*)in_port;

    char buf[98];
    std::sprintf(buf, "%d", (int) int_port);
    string port(buf); // = std::to_string(int_port);

    addrinfo hints;
    addrinfo* res;
    
    memset(&hints, 0, sizeof(struct addrinfo));
    
    hints.ai_flags = AI_PASSIVE;
    hints.ai_family = AF_INET;
    hints.ai_socktype = SOCK_STREAM;
    //hints.ai_socktype = SOCK_DGRAM;
    
    if (0 != getaddrinfo(NULL, port.c_str(), &hints, &res)) {
       RmpCout() << "illegal port number or port is busy.\n" << "\n";
       return NULL;
    }

    //struct sockaddr_in *temp = (struct sockaddr_in *) res;
    //struct in_addr *str_addr = &temp->sin_addr;
    UDTSOCKET serv = UDT::socket(res->ai_family, res->ai_socktype, res->ai_protocol);
    
    // UDT Options
    //UDT::setsockopt(serv, 0, UDT_CC, new CCCFactory<CUDPBlast>, sizeof(CCCFactory<CUDPBlast>));
    //UDT::setsockopt(serv, 0, UDT_MSS, new int(9000), sizeof(int));
    //UDT::setsockopt(serv, 0, UDT_RCVBUF, new int(10000000), sizeof(int));
    //UDT::setsockopt(serv, 0, UDP_RCVBUF, new int(10000000), sizeof(int));
    
    if (UDT::ERROR == UDT::bind(serv, res->ai_addr, res->ai_addrlen)) {
       RmpCout() << "bind: " << UDT::getlasterror().getErrorMessage() << "\n";
       return NULL;
    }
    
    freeaddrinfo(res);
    
    if (UDT::ERROR == UDT::listen(serv, 100))
    {
       RmpCout() << "listen: " << UDT::getlasterror().getErrorMessage() << "\n";
       return NULL;
    }

    sockaddr_storage clientaddr;
    int addrlen = sizeof(clientaddr);
    
    UDTSOCKET recver;
    
    RmpCout() << "Waiting on accept(). Server is ready at port: " << port << "\n";
    
    while (true)
    {
       if (int_port == 9999)
            varnish_port = 80;
       else
            varnish_port = 443;
       if (UDT::INVALID_SOCK == (recver = UDT::accept(serv, (sockaddr*)&clientaddr, &addrlen, varnish_port)))
       {
          RmpCout() << "accept: " << UDT::getlasterror().getErrorMessage() << "\n";
          return NULL;
       }
    
       char clienthost[NI_MAXHOST];
       char clientservice[NI_MAXSERV];
       getnameinfo((sockaddr *)&clientaddr, addrlen, clienthost, sizeof(clienthost), clientservice, sizeof(clientservice), NI_NUMERICHOST|NI_NUMERICSERV);
       RmpCout() << "new connection: " << clienthost << ":" << clientservice << "\n";
    
       pthread_t rcvthread;
       pthread_create(&rcvthread, NULL, serverThreadEntry, new UDTSOCKET(recver));
       pthread_detach(rcvthread);
    }
    
    UDT::close(serv);
}

void* serverThreadEntry(void* usocket)
{
    UDTSOCKET udtServSock = *(UDTSOCKET*)usocket;
    delete (UDTSOCKET*)usocket;

    char *requestdata = new char[4096];
    while (1)
    {
        if (UDT::ERROR == UDT::recv(udtServSock, requestdata, 4096, 0))
        {
            RmpCout() << "recv error:" << UDT::getlasterror().getErrorMessage() << "\n";
            break;
        }
    }

    return NULL;
}

