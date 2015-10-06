#ifndef __CONFIG_RMP_H__
#define __CONFIG_RMP_H__

#ifndef WIN32
   #include <sys/types.h>
   #include <sys/socket.h>
   #include <netinet/in.h>
#else
   #ifdef __MINGW__
      #include <stdint.h>
      #include <ws2tcpip.h>
   #endif
   #include <windows.h>
#endif
#include <iostream>
#include <fstream>
#include <set>
#include <string>
#include <vector>
#include <iostream>


namespace RMP_CONFIG
{

    extern int udt_enable_log;
    extern int rmp_enable_cid;
    extern std::ofstream rmp_logfile;
    extern int rmp_initial_cwnd;

}  // namespace RMP_CONFIG

/* For Logging */
struct RmpCout
{
    template< class T >
    RmpCout &operator<<( T val )
    {
        if (RMP_CONFIG::udt_enable_log) {
            RMP_CONFIG::rmp_logfile << val;
            RMP_CONFIG::rmp_logfile.flush();
        }
        return *this;
    }
};
#endif

