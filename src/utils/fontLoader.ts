type FontConfig = {
    title: string;
    text?: string;
    customTitleFont?: boolean;
    customTextFont?: boolean;
};

// Strategy 'preload' is for high priority (hover), 'prefetch' for background (lazy)
export const preloadFonts = (fonts?: FontConfig, slug?: string, strategy: 'preload' | 'prefetch' = 'preload') => {
    if (!fonts || !slug) return;

    const { title, text, customTitleFont, customTextFont } = fonts;
    
    // Handle Google Fonts
    const fontList = [
        { name: title, isCustom: customTitleFont },
        { name: text, isCustom: customTextFont }
    ];

    const googleFonts = fontList.filter(f => !f.isCustom && f.name);
    
    if (googleFonts.length > 0) {
        const families = googleFonts.map(f => (f.name as string).replace(/ /g, '+')).join('&family=');
        const href = `https://fonts.googleapis.com/css2?family=${families}&display=swap`;
        
        // CSS files are always stylesheets, prefetch helps put them in cache
        if (!document.querySelector(`link[href="${href}"]`)) {
            const link = document.createElement('link');
            link.href = href;
            // For Google Fonts CSS, 'preload' as 'style' or 'prefetch'
            if (strategy === 'preload') {
                link.rel = 'stylesheet'; // Immediate apply/load
            } else {
                link.rel = 'prefetch'; // Low priority cache
                link.as = 'style';
            }
            document.head.appendChild(link);
        }
    }

    // Handle Custom Fonts
    const customFonts = fontList.filter(f => f.isCustom && f.name);
    customFonts.forEach(font => {
        const filename = (font.name as string).replace(/ /g, '-');
        const href = `/projects/${slug}/fonts/${filename}.woff2`; 

        if (!document.querySelector(`link[href="${href}"]`)) {
            const link = document.createElement('link');
            link.href = href;
            link.rel = strategy; // 'preload' or 'prefetch'
            link.as = 'font';
            link.type = 'font/woff2';
            link.crossOrigin = 'anonymous';
            document.head.appendChild(link);
        }
    });
};
