C++ = g++

ifndef os
   os = LINUX
endif

ifndef arch
   arch = IA32
endif

CCFLAGS = -fPIC -Wall -Wextra -D$(os) -finline-functions -O3 -fno-strict-aliasing -fvisibility=hidden

ifeq ($(arch), IA32)
   CCFLAGS += -DIA32
endif

ifeq ($(arch), POWERPC)
   CCFLAGS += -mcpu=powerpc
endif

ifeq ($(arch), SPARC)
   CCFLAGS += -DSPARC
endif

ifeq ($(arch), IA64)
   CCFLAGS += -DIA64
endif

ifeq ($(arch), AMD64)
   CCFLAGS += -DAMD64
endif

MKDIR_P = mkdir -p
OBJDIR=../obj
EXEDIR=../bin
FULL_EXEDIR = $(realpath $(EXEDIR))

OBJS = $(addprefix $(OBJDIR)/, api.o buffer.o cache.o ccc.o channel.o common.o core.o epoll.o list.o md5.o packet.o queue.o window.o)
DIR = $(shell pwd)

.PHONY: directories
all: directories $(EXEDIR)/libudt.so $(EXEDIR)/libudt.a $(EXEDIR)/udt

directories: ${EXEDIR} ${OBJDIR}
${EXEDIR}:
	${MKDIR_P} ${EXEDIR}
${OBJDIR}:
	${MKDIR_P} ${OBJDIR}

$(OBJDIR)/%.o: %.cpp %.h udt.h
	$(C++) $(CCFLAGS) $< -o $@ -c

$(EXEDIR)/libudt.so: $(OBJS)
ifneq ($(os), OSX)
	$(C++) -shared -o $@ $^
else
	$(C++) -dynamiclib -o libudt.dylib -lstdc++ -lpthread -lm $^
endif

$(EXEDIR)/libudt.a: $(OBJS)
	ar -rcs $@ $^ -o $@

$(EXEDIR)/udt:
	cp udt.h $@

clean:
	rm -fr *.o *.so *.dylib *.a udt $(OBJDIR) $(EXEDIR)

install:
	export LD_LIBRARY_PATH=$(FULL_EXEDIR):$$LD_LIBRARY_PATH
