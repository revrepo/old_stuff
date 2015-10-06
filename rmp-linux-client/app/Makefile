C++ = g++

ifndef os
   os = LINUX
endif

ifndef arch
   arch = IA32
endif

CCFLAGS = -Wall -D$(os) -I../src -finline-functions -O3

ifeq ($(arch), IA32)
   CCFLAGS += -DIA32 #-mcpu=pentiumpro -march=pentiumpro -mmmx -msse
endif

ifeq ($(arch), POWERPC)
   CCFLAGS += -mcpu=powerpc
endif

ifeq ($(arch), IA64)
   CCFLAGS += -DIA64
endif

ifeq ($(arch), SPARC)
   CCFLAGS += -DSPARC
endif

OBJDIR=../obj
EXEDIR=../bin
FULL_EXEDIR = $(realpath $(EXEDIR))
LDFLAGS = -L$(EXEDIR) -ludt -lstdc++ -lpthread -lm
LDFLAGS_NOTHREAD = -L../src -ludt -lstdc++ -lm

ifeq ($(os), UNIX)
   LDFLAGS += -lsocket
   LDFLAGS_NOTHREAD += -lsocket
endif

ifeq ($(os), SUNOS)
   LDFLAGS += -lrt -lsocket
   LDFLAGS_NOTHREAD += -lrt -lsocket
endif

#OBJS = $(addprefix $(OBJDIR)/, udt-client.o)
DIR = $(shell pwd)

APP = $(EXEDIR)/udt-client
all: $(APP)

$(OBJDIR)/%.o: %.cpp
	$(C++) $(CCFLAGS) $< -c -o $@

$(EXEDIR)/udt-client: $(OBJDIR)/udt-client.o
	$(C++) $^ -o $@ $(LDFLAGS)

clean:
	rm -f $(APP)  $(OBJDIR)/udt-client.o

install:
	export PATH=$(FULL_EXEDIR):$$PATH
