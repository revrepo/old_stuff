#ifndef WIN32
   #include <unistd.h>
   #include <cstdlib>
   #include <cstring>
   #include <netdb.h>
   #include <sstream>
#else
   #include <winsock2.h>
   #include <ws2tcpip.h>
   #include <wspiapi.h>
#endif
#include <iostream>
#include <udt.h>
#include "cc.h"
#include "test_util.h"

using namespace std;

#ifndef WIN32
void* monitor(void*);
#else
DWORD WINAPI monitor(LPVOID);
#endif

#define CR "\r"
#define LF "\n"

int main(int argc, char* argv[])
{
   if ((3 != argc) || (0 == atoi(argv[2])))
   {
      cout << "usage: appclient server_ip server_port" << endl;
      return 0;
   }

   // Automatically start up and clean up UDT module.
   UDTUpDown _udt_;

   struct addrinfo hints, *local, *peer;

   memset(&hints, 0, sizeof(struct addrinfo));

   hints.ai_flags = AI_PASSIVE;
   hints.ai_family = AF_INET;
   hints.ai_socktype = SOCK_STREAM;
   //hints.ai_socktype = SOCK_DGRAM;

   if (0 != getaddrinfo(NULL, "9000", &hints, &local))
   {
      cout << "incorrect network address.\n" << endl;
      return 0;
   }

   //char* getRequest = new char[200];
   string req = "GET /3kb.html HTTP/1.1\r\nUser-Agent: Wget/1.14 (linux-gnu)\r\nAccept: */*\r\nHost: sjc-lab\r\nConnection: Keep-Alive\r\n\r\n";
   int ss; //, length = 0;

#if 0
   //std::ostringstream Request;
   //length = sprintf(getRequest, "%s%s%s", "GET /3kb.html HTTP/1.1", CR, LF);
   // getRequest << 'GET /3kb.html HTTP/1.1' << CR << LF;
   //Request << 'User-Agent: Wget/1.14 (linux-gnu)' << CR << LF;
   //Request << 'Accept: */*' << CR << LF;
   //Request << 'Host: sjc-lab' << CR << LF;
   //Request << 'Connection: Keep-Alive' << CR << LF << CR << LF;
   length = strlen("GET /3kb.html HTTP/1.1\r\nUser-Agent: Wget/1.14 (linux-gnu)\r\nAccept: */*\r\nHost: sjc-lab\r\nConnection: Keep-Alive\r\n\r\n");
   strlcpy(getRequest, "GET /3kb.html HTTP/1.1\r\nUser-Agent: Wget/1.14 (linux-gnu)\r\nAccept: */*\r\nHost: sjc-lab\r\nConnection: Keep-Alive\r\n\r\n", length + 1);
   cout << "Length = " << length << "," << getRequest << endl;
#endif

   cout << "length = " << req.length() << "," << "Pointer: " << (void *) req.c_str() << endl;
   UDTSOCKET client = UDT::socket(local->ai_family, local->ai_socktype, local->ai_protocol);

   // UDT Options
   //UDT::setsockopt(client, 0, UDT_CC, new CCCFactory<CUDPBlast>, sizeof(CCCFactory<CUDPBlast>));
   //UDT::setsockopt(client, 0, UDT_MSS, new int(9000), sizeof(int));
   //UDT::setsockopt(client, 0, UDT_SNDBUF, new int(10000000), sizeof(int));
   //UDT::setsockopt(client, 0, UDP_SNDBUF, new int(10000000), sizeof(int));
   //UDT::setsockopt(client, 0, UDT_MAXBW, new int64_t(12500000), sizeof(int));

   // Windows UDP issue
   // For better performance, modify HKLM\System\CurrentControlSet\Services\Afd\Parameters\FastSendDatagramThreshold
   #ifdef WIN32
      UDT::setsockopt(client, 0, UDT_MSS, new int(1052), sizeof(int));
   #endif

   // for rendezvous connection, enable the code below
   /*
   UDT::setsockopt(client, 0, UDT_RENDEZVOUS, new bool(true), sizeof(bool));
   if (UDT::ERROR == UDT::bind(client, local->ai_addr, local->ai_addrlen))
   {
      cout << "bind: " << UDT::getlasterror().getErrorMessage() << endl;
      return 0;
   }
   */

   freeaddrinfo(local);

   if (0 != getaddrinfo(argv[1], argv[2], &hints, &peer))
   {
      cout << "incorrect server/peer address. " << argv[1] << ":" << argv[2] << endl;
      return 0;
   }

   // connect to the server, implict bind
   if (UDT::ERROR == UDT::connect(client, peer->ai_addr, peer->ai_addrlen))
   {
      cout << "connect: " << UDT::getlasterror().getErrorMessage() << endl;
      return 0;
   }

   freeaddrinfo(peer);

   // using CC method
   //CUDPBlast* cchandle = NULL;
   //int temp;
   //UDT::getsockopt(client, 0, UDT_CC, &cchandle, &temp);
   //if (NULL != cchandle)
   //   cchandle->setRate(500);

   //int size = 100000;
   //char* data = new char[size];

   #ifndef WIN32
      pthread_create(new pthread_t, NULL, monitor, &client);
   #else
      CreateThread(NULL, 0, monitor, &client, 0, NULL);
   #endif

   cout << "Sending Request" << endl;
   
   if (UDT::ERROR == (ss = UDT::send(client, req.c_str(), req.length(), 0)))
   {
        cout << "send:" << UDT::getlasterror().getErrorMessage() << endl;
        return 0;
   }

   char* data = new char[1024];
   // unsigned long t5 = getTsMs();

   {
      int ssize = 0, httpHdrPrint = 1, i;

      while (1) //ssize < 900*1024) // kile bytes
      {
         if (UDT::ERROR == (ss = UDT::recv(client, data, 1024, 0)))
         {
            cout << "recv error:" << UDT::getlasterror().getErrorMessage() << endl;
            break;
         }
         if (httpHdrPrint)
         {
            for (i = 0 ; i < ss - 1;  i ++)
            {
                if (data[i] == 0x0d && data[i+1] == 0x0a)
                {
                    data[i] = '\0';
                    cout << "HTTP Response: " << data << endl;
                    httpHdrPrint = 0;
                }
            }
         }
         ssize += ss;
	 cout << "Received " << ss << " bytes" << endl;
         // t5 = getTsMs();
      }
      cout << "Bytes Received " << ssize << endl;
   }

   UDT::close(client);
   delete [] data;
   return 0;
}

#ifndef WIN32
void* monitor(void* s)
#else
DWORD WINAPI monitor(LPVOID s)
#endif
{
   //UDTSOCKET u = *(UDTSOCKET*)s;
   return NULL;
}

#if 0
#ifndef WIN32
void* monitor(void* s)
#else
DWORD WINAPI monitor(LPVOID s)
#endif
{
   UDTSOCKET u = *(UDTSOCKET*)s;

   UDT::TRACEINFO perf;

   cout << "SendRate(Mb/s)\tRTT(ms)\tCWnd\tPktSndPeriod(us)\tRecvACK\tRecvNAK" << endl;

   while (true)
   {
      #ifndef WIN32
         sleep(1);
      #else
         Sleep(1000);
      #endif

      if (UDT::ERROR == UDT::perfmon(u, &perf))
      {
         cout << "perfmon: " << UDT::getlasterror().getErrorMessage() << endl;
         break;
      }

      cout << perf.mbpsSendRate << "\t\t" 
           << perf.msRTT << "\t" 
           << perf.pktCongestionWindow << "\t" 
           << perf.usPktSndPeriod << "\t\t\t" 
           << perf.pktRecvACK << "\t" 
           << perf.pktRecvNAK << endl;
   }

   #ifndef WIN32
      return NULL;
   #else
      return 0;
   #endif
}
#endif
