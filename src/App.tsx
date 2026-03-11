import { WidgetConfigProvider } from "./context/WidgetConfigContext";
import { ConfigPanel } from "./components/ConfigPanel";
import { ChatPreview } from "./components/ChatPreview";

function App() {
  return (
    <WidgetConfigProvider>
      <div className="flex h-screen bg-[#F8F9FA]">
        {/* Left Sidebar - Navigation */}
        <div className="w-16 bg-[#1E3A5F] flex flex-col items-center py-4 gap-4">
          {/* Chat Settings Icon - Active */}
          <div className="w-10 h-10 flex items-center justify-center bg-[#205AE3] rounded-lg">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              className="text-white"
            >
              <path
                d="M10 2C5.58 2 2 5.58 2 10C2 14.42 5.58 18 10 18C14.42 18 18 14.42 18 10C18 5.58 14.42 2 10 2ZM10 16C6.69 16 4 13.31 4 10C4 6.69 6.69 4 10 4C13.31 4 16 6.69 16 10C16 13.31 13.31 16 10 16Z"
                fill="white"
              />
            </svg>
          </div>
          {/* Other icons would go here */}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Configuration (Figma 996:25324: padding 12px) */}
          <div
            className="w-[700px] flex-shrink-0 overflow-y-auto bg-[#F8F9FA]"
            style={{ padding: 12 }}
          >
            <ConfigPanel />
          </div>

          {/* Right Panel - Preview */}
          <div className="flex-1 min-w-0 overflow-hidden">
            <ChatPreview />
          </div>
        </div>
      </div>
    </WidgetConfigProvider>
  );
}

export default App;

