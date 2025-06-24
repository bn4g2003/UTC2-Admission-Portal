import React, { useEffect } from 'react';

declare global {
  interface Window {
    botpress?: any;
  }
}

interface BotpressChatProps {
  width?: string;
  height?: string;
}

const BotpressChat: React.FC<BotpressChatProps> = ({ width = '500px', height = '500px' }) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.botpress.cloud/webchat/v3.0/inject.js';
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      // Đảm bảo window.botpress đã sẵn sàng trước khi khởi tạo
      if (window.botpress) {
        window.botpress.on('webchat:ready', () => {
          window.botpress.open();
        });

        window.botpress.init({
          botId: 'd1801359-1312-4d8d-b060-54ec36e739db',
          configuration: {
            version: 'v1',
            composerPlaceholder: 'Nhập câu hỏi của bạn...',
            botName: 'TUYỂN SINH UTC2',
            botAvatar: 'https://files.bpcontent.cloud/2025/06/24/05/20250624054812-S4SKHIFO.png',
            fabImage: 'https://files.bpcontent.cloud/2025/06/24/05/20250624054812-S4SKHIFO.png',
            website: {
              title: 'tuyensinh@utc2.edu.vn',
              link: 'tuyensinh@utc2.edu.vn',
            },
            email: {
              title: '',
              link: '',
            },
            phone: {
              title: '024.3869.3108',
              link: '024.3869.3108',
            },
            termsOfService: {},
            privacyPolicy: {},
            color: '#3276EA',
            variant: 'solid',
            headerVariant: 'solid',
            themeMode: 'light',
            fontFamily: 'inter',
            radius: 1,
            feedbackEnabled: false,
            footer: '⚡Nhật Bằng ',
            additionalStylesheetUrl: 'https://files.bpcontent.cloud/2025/06/24/05/20250624051521-42Z82D0J.css',
            allowFileUpload: false,
            storageLocation: 'localStorage',
          },
          clientId: 'a9a19562-8616-4e4e-868a-cb7d9b619327',
          selector: '#webchat',
        });
      }
    };

    // Cleanup: Xóa script khi component unmount
    return () => {
      document.head.removeChild(script);
    };
  }, []); 

  return (
    <>
      {}
      <style jsx>{`
        #webchat .bpWebchat {
          position: unset;
          width: 100%;
          height: 100%;
          max-height: 100%;
          max-width: 100%;
        }

        #webchat .bpFab {
          display: none;
        }
      `}</style>

      {}
      <div id="webchat" style={{ width, height }}></div>
    </>
  );
};

export default BotpressChat;