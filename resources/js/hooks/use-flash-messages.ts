import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

interface FlashMessages {
    success?: string;
    error?: string;
    info?: string;
    warning?: string;
}

interface PageProps {
    flash?: FlashMessages;
    [key: string]: unknown;
}

export function useFlashMessages() {
    const page = usePage<PageProps>();
    const flash = page.props.flash;

    useEffect(() => {
        if (!flash) return;

        if (flash.success) {
            toast.success(flash.success);
        }
        if (flash.error) {
            toast.error(flash.error);
        }
        if (flash.info) {
            toast.info(flash.info);
        }
        if (flash.warning) {
            toast.warning(flash.warning);
        }
    }, [flash]);
}
