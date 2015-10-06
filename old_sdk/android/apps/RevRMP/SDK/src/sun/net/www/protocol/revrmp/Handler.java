package sun.net.www.protocol.revrmp;

import java.io.IOException;
import java.net.URL;
import java.net.URLConnection;
import java.net.URLStreamHandler;

import sun.net.www.protocol.revrmp.HttpConnection;

public class Handler extends URLStreamHandler 
{
	private boolean useTcp = true;
	
	public Handler (String protocol) 
	{
		if (protocol.equals("RMP")) {
			useTcp = false;
		}
	}
	
    @Override
    protected URLConnection openConnection(URL u) 
    throws IOException 
    {
        return new HttpConnection(u, useTcp);
    }
}
