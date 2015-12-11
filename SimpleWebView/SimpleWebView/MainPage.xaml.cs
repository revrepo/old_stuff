using SimpleWebView.ViewModel;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Diagnostics;
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
        private ConcurrentDictionary<string, Stopwatch> _Timers;

        public MainPage()
        {
            this.InitializeComponent();

            this.DataContext = new AppViewModel();

            _Timers = new ConcurrentDictionary<string, Stopwatch>();
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

            (this.DataContext as AppViewModel).StatusItems.Clear();

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
            _StartTimer(args);
        }

        private void WebView_NavigationCompleted(WebView sender, WebViewNavigationCompletedEventArgs args)
        {
            _CompleteTimer(args);
        }

        private void WebView_FrameNavigationStarting(WebView sender, WebViewNavigationStartingEventArgs args)
        {
            _StartTimer(args);
        }

        private void _StartTimer(WebViewNavigationStartingEventArgs args)
        {
            if (args.Uri.ToString() == "about:blank")
            {
                return;
            }

            var sw = new Stopwatch();
            sw.Start();

            _Timers.TryAdd(args.Uri.ToString(), sw);
        }

        private void WebView_FrameNavigationCompleted(WebView sender, WebViewNavigationCompletedEventArgs args)
        {
            _CompleteTimer(args);
        }

        private void _CompleteTimer(WebViewNavigationCompletedEventArgs args)
        {
            Stopwatch sw = null;

            if (_Timers.TryRemove(args.Uri.ToString(), out sw))
            {
                sw.Stop();

                var statusItem = string.Format("[{0}ms] {1}", sw.ElapsedMilliseconds, args.Uri.ToString());

                (this.DataContext as AppViewModel).StatusItems.Add(statusItem);

                Debug.WriteLine(statusItem);

                sw = null;
            }
        }
    }
}
