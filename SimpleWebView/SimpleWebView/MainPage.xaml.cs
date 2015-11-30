using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices.WindowsRuntime;
using Windows.Foundation;
using Windows.Foundation.Collections;
using Windows.UI.Popups;
using Windows.UI.Xaml;
using Windows.UI.Xaml.Controls;
using Windows.UI.Xaml.Controls.Primitives;
using Windows.UI.Xaml.Data;
using Windows.UI.Xaml.Input;
using Windows.UI.Xaml.Media;
using Windows.UI.Xaml.Navigation;

// The Blank Page item template is documented at http://go.microsoft.com/fwlink/?LinkId=402352&clcid=0x409

namespace SimpleWebView
{
    /// <summary>
    /// An empty page that can be used on its own or navigated to within a Frame.
    /// </summary>
    public sealed partial class MainPage : Page
    {
        public MainPage()
        {
            this.InitializeComponent();
        }

        private void Button_Click(object sender, RoutedEventArgs e)
        {
            _Navigate();
        }

        private void _Navigate()
        {
            if (!AddressBar.Text.StartsWith("http"))
            {
                AddressBar.Text = "http://" + AddressBar.Text;
            }

            try
            {
                WebView.Navigate(new Uri(AddressBar.Text, UriKind.Absolute));
                WebView.Focus(FocusState.Programmatic);
            }
            catch (Exception ex)
            {
                var d = new MessageDialog("Error: " + ex.Message);
                d.ShowAsync();
            }
        }

        private void AddressBar_KeyUp(object sender, KeyRoutedEventArgs e)
        {
            if (e.Key == Windows.System.VirtualKey.Accept || e.Key == Windows.System.VirtualKey.Enter)
            {
                _Navigate();
            }
        }

        private void WebView_NavigationStarting(WebView sender, WebViewNavigationStartingEventArgs args)
        {
            System.Diagnostics.Debug.WriteLine("Navigation starting: " + args.Uri.ToString());
        }

        private void WebView_NavigationCompleted(WebView sender, WebViewNavigationCompletedEventArgs args)
        {
            System.Diagnostics.Debug.WriteLine("Navigation completed: " + args.Uri.ToString());
        }

        private void WebView_FrameNavigationStarting(WebView sender, WebViewNavigationStartingEventArgs args)
        {
            System.Diagnostics.Debug.WriteLine("Frame navigation starting: " + args.Uri.ToString());
        }

        private void WebView_FrameNavigationCompleted(WebView sender, WebViewNavigationCompletedEventArgs args)
        {
            System.Diagnostics.Debug.WriteLine("Frame navigation completed: " + args.Uri.ToString());
        }
    }
}
