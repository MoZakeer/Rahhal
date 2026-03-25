import { motion, AnimatePresence } from "framer-motion";

interface LoadingOverlayProps {
    show: boolean;
    text?: string;
}

export default function LoadingOverlay({
    show,
    text = "Loading..."
}: LoadingOverlayProps) {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white px-8 py-6 rounded-2xl shadow-xl flex flex-col items-center gap-4"
                    >
                        {/* Spinner */}
                        <div className="w-10 h-10 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>

                        <p className="text-gray-700 font-medium">
                            {text}
                        </p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}