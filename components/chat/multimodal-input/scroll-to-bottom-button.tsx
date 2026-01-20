import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ScrollToBottomButtonProps {
  isAtBottom: boolean;
  scrollToBottom: () => void;
}

export function ScrollToBottomButton({
  isAtBottom,
  scrollToBottom,
}: ScrollToBottomButtonProps) {
  return (
    <AnimatePresence>
      {!isAtBottom && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="absolute bottom-28 left-1/2 z-50 -translate-x-1/2"
        >
          <Button
            data-testid="scroll-to-bottom-button"
            className="rounded-full hover:bg-accent hover:text-accent-foreground"
            size="icon"
            variant="outline"
            onClick={(event) => {
              event.preventDefault();
              scrollToBottom();
            }}
          >
            <ArrowDown />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
