import React, { useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { SITE_ASSETS } from '../../constants/siteAssets';
const appMockup = SITE_ASSETS.appMockup;

export default function AIApp() {
  useEffect(() => {
    document.title = 'Wild Tuskers Sri Lanka | AI Tusker Re-Identification';
    // Strictly disable window and body scroll on this page
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = originalHtmlOverflow === 'hidden' ? '' : (originalHtmlOverflow || '');
      document.body.style.overflow = originalBodyOverflow === 'hidden' ? '' : (originalBodyOverflow || '');
    };
  }, []);

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-[#081810] text-white flex flex-col justify-center select-none">
      {/* Full-screen fixed background color & ambient glow (eliminates any white gap) */}
      <div className="fixed inset-0 bg-[#081810] pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-[#c69b55]/10 rounded-full blur-[140px]" />
      </div>

      {/* Main Container - Exactly fitted to viewport */}
      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-14 xl:px-20 pt-[74px] sm:pt-[80px] pb-3 flex-1 flex flex-col justify-center my-auto overflow-hidden">
        
        {/* Showcase Content */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 sm:gap-10 lg:gap-14 xl:gap-20 my-auto w-full">
          
          {/* Left Side: Enlarged Phone Mockup (tightly fitted without empty margins) */}
          <div className="shrink-0 flex justify-center items-center">
            <img
              src={appMockup}
              alt="AI-Assisted Individual Wild Tusker Re-Identification Mobile App"
              className="w-auto max-h-[60vh] sm:max-h-[66vh] lg:max-h-[73vh] xl:max-h-[77vh] object-contain drop-shadow-[0_24px_50px_rgba(0,0,0,0.85)] hover:scale-[1.01] transition-transform duration-300 pointer-events-none"
            />
          </div>

          {/* Right Side: Text & Store Badges (stretched to the left side) */}
          <div className="flex-1 max-w-[760px] xl:max-w-[820px] flex flex-col items-start text-left">
            
            {/* Heading */}
            <h1 className="font-serif text-[1.95rem] sm:text-[2.4rem] lg:text-[2.85rem] xl:text-[3.2rem] font-bold text-white leading-[1.15] tracking-tight m-0 mb-4 sm:mb-5">
              AI assisted individual wild tusker re-identification
            </h1>

            {/* Description */}
            <p className="font-sans text-[0.94rem] sm:text-[1rem] lg:text-[1.05rem] text-white/80 leading-[1.7] m-0 mb-6 sm:mb-7">
              A state-of-the-art mobile computer vision platform purpose-built for wildlife researchers,
              field guides, and conservation officers to instantly recognize individual Sri Lankan wild tuskers
              from field photos with automated biometric verification.
            </p>

            {/* Features bullet list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-3.5 sm:gap-y-4 w-full mb-7 sm:mb-8">
              <div className="flex items-center gap-2.5 text-white/85 text-[0.88rem] sm:text-[0.92rem]">
                <CheckCircle2 size={17} className="text-accent shrink-0" />
                <span>Instant on-device tusker identification</span>
              </div>
              <div className="flex items-center gap-2.5 text-white/85 text-[0.88rem] sm:text-[0.92rem]">
                <CheckCircle2 size={17} className="text-accent shrink-0" />
                <span>Offline operation in remote parks</span>
              </div>
              <div className="flex items-center gap-2.5 text-white/85 text-[0.88rem] sm:text-[0.92rem]">
                <CheckCircle2 size={17} className="text-accent shrink-0" />
                <span>Live sync with WTS Registry</span>
              </div>
              <div className="flex items-center gap-2.5 text-white/85 text-[0.88rem] sm:text-[0.92rem]">
                <CheckCircle2 size={17} className="text-accent shrink-0" />
                <span>Automated GPS &amp; encounter logs</span>
              </div>
            </div>

            {/* Store Download Badges (App Store & Google Play) */}
            <div className="flex flex-row items-center gap-4 sm:gap-5 flex-wrap">
              
              {/* Apple App Store Badge */}
              <a
                href="#app-store"
                onClick={(e) => {
                  e.preventDefault();
                  alert('The Wild Tuskers iOS App is currently in TestFlight review and will be available on the App Store soon!');
                }}
                className="inline-flex items-center gap-3 px-4 py-2 sm:px-4.5 sm:py-2.5 rounded-[10px] bg-black hover:bg-[#151515] border border-white/25 hover:border-white/50 text-white shadow-lg transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] no-underline cursor-pointer group"
                title="Download on the App Store"
              >
                <svg viewBox="0 0 170 170" fill="currentColor" className="w-6 h-6 sm:w-7 sm:h-7 shrink-0 text-white">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.58-7.8-11.65-14.3-5.75-9.22-10.23-19.89-13.43-32.02-3.21-12.13-4.81-23.71-4.81-34.74 0-14.12 3.63-26.04 10.89-35.77 7.26-9.73 16.59-14.7 27.99-14.92 4.9 0 10.24 1.25 16.03 3.75 5.79 2.5 9.77 3.8 11.94 3.92 1.96-.12 6.07-1.47 12.33-4.04 6.26-2.58 11.59-3.77 15.99-3.58 12.3.66 22.08 5.17 29.35 13.54-10.66 6.42-15.88 15.35-15.66 26.79.22 8.92 3.69 16.53 10.41 22.84 6.72 6.31 14.86 9.87 24.42 10.69-2.28 7.07-5.06 14.2-8.35 21.39zM119.22 31.84c0-7.07 2.61-13.77 7.84-20.1 5.22-6.32 11.75-10.55 19.58-12.69.22 1.09.33 2.18.33 3.27 0 6.97-2.67 13.68-8.01 20.14-5.33 6.45-11.89 10.74-19.67 12.86-.07-1.19-.07-2.35-.07-3.48z" />
                </svg>
                <div className="flex flex-col items-start text-left leading-tight">
                  <span className="text-[0.6rem] sm:text-[0.64rem] font-sans font-normal text-white/80 tracking-tight">Download on the</span>
                  <span className="text-[1rem] sm:text-[1.1rem] font-sans font-semibold text-white tracking-tight -mt-0.5">App Store</span>
                </div>
              </a>

              {/* Google Play Store Badge */}
              <a
                href="#google-play"
                onClick={(e) => {
                  e.preventDefault();
                  alert('The Wild Tuskers Android App is currently in closed testing and will be available on Google Play soon!');
                }}
                className="inline-flex items-center gap-3 px-4 py-2 sm:px-4.5 sm:py-2.5 rounded-[10px] bg-black hover:bg-[#151515] border border-white/25 hover:border-white/50 text-white shadow-lg transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] no-underline cursor-pointer group"
                title="GET IT ON Google Play"
              >
                <svg viewBox="0 0 512 512" className="w-5 h-5 sm:w-6 sm:h-6 shrink-0">
                  <path fill="#4285F4" d="M48.2 38.6c-4.4 7.6-6.9 17.4-6.9 28.7v377.4c0 11.3 2.5 21.1 6.9 28.7l217-217.4-217-217.4z"/>
                  <path fill="#FBBC04" d="M327.9 318.5l-62.7-62.5L48.2 473.4c6.7 4.5 15.3 6.6 24.8 1.1l254.9-156z"/>
                  <path fill="#EA4335" d="M327.9 193.5L73 37.5c-9.5-5.5-18.1-3.4-24.8 1.1l217 217.4 62.7-62.5z"/>
                  <path fill="#34A853" d="M428.4 237.7l-100.5-57.8-62.7 62.5 62.7 62.5 100.5-57.8c18-10.4 18-27.4 0-37.8z"/>
                </svg>
                <div className="flex flex-col items-start text-left leading-tight">
                  <span className="text-[0.54rem] sm:text-[0.58rem] font-sans font-medium text-white/80 uppercase tracking-wider">GET IT ON</span>
                  <span className="text-[1rem] sm:text-[1.1rem] font-sans font-semibold text-white tracking-tight -mt-0.5">Google Play</span>
                </div>
              </a>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
