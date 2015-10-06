package sun.net.www.protocol.revrmp;

import java.io.IOException;
import java.net.URL;
import java.net.URLConnection;
import java.net.URLStreamHandler;

public class RmpHandler extends URLStreamHandler 
{
    @Override
    protected URLConnection openConnection(URL u) 
    throws IOException 
    {
    	System.out.println("Handler : "+u.toString());
        return new HttpConnection(u);
    }
}