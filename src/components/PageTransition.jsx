import { motion, AnimatePresence } from 'framer-motion';

const variants = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.15 } },
};

export default function PageTransition({ children, keyVal }) {
    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={keyVal}
                variants={variants}
                initial="initial"
                animate="animate"
                exit="exit"
                style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}
