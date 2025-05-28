declare module 'responsivevoice' {
    interface ResponsiveVoiceOptions {
        onstart?: () => void;
        onend?: () => void;
        onerror?: (error: any) => void;
        rate?: number;
        pitch?: number;
    }

    interface ResponsiveVoice {
        speak(text: string, voice: string, options?: ResponsiveVoiceOptions): void;
        cancel(): void;
    }

    const ResponsiveVoice: ResponsiveVoice;
    export default ResponsiveVoice;
} 