import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { useLocation } from "react-router-dom";
import { ReactNode, createContext, useContext, useState } from "react";

interface PageTransitionProps {
  children: ReactNode;
}

// Shared element context for cross-page animations
interface SharedElementContextType {
  registerElement: (id: string, rect: DOMRect) => void;
  getElement: (id: string) => DOMRect | undefined;
  clearElement: (id: string) => void;
}

const SharedElementContext = createContext<SharedElementContextType | null>(null);

export const useSharedElement = () => {
  const context = useContext(SharedElementContext);
  if (!context) {
    throw new Error("useSharedElement must be used within SharedElementProvider");
  }
  return context;
};

export const SharedElementProvider = ({ children }: { children: ReactNode }) => {
  const [elements, setElements] = useState<Map<string, DOMRect>>(new Map());

  const registerElement = (id: string, rect: DOMRect) => {
    setElements(prev => new Map(prev).set(id, rect));
  };

  const getElement = (id: string) => elements.get(id);

  const clearElement = (id: string) => {
    setElements(prev => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  };

  return (
    <SharedElementContext.Provider value={{ registerElement, getElement, clearElement }}>
      <LayoutGroup>
        <>{children}</>
      </LayoutGroup>
    </SharedElementContext.Provider>
  );
};

// Page transition variants
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
  out: {
    opacity: 0,
    y: -10,
    scale: 0.99,
  },
};

const pageTransition = {
  type: "tween" as const,
  ease: [0.25, 0.46, 0.45, 0.94] as const,
  duration: 0.4,
};

export const PageTransition = ({ children }: PageTransitionProps) => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        className="w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// Shared element component for cross-page animations
interface SharedElementProps {
  id: string;
  children: ReactNode;
  className?: string;
}

export const SharedElement = ({ id, children, className }: SharedElementProps) => {
  return (
    <motion.div
      layoutId={id}
      className={className}
      transition={{
        type: "spring",
        stiffness: 350,
        damping: 30,
      }}
    >
      {children}
    </motion.div>
  );
};

// Motion variants for staggered children
export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    }
  },
};

// Fast stagger for lists
export const fastStaggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

export const fastStaggerItem = {
  hidden: { opacity: 0, x: -10 },
  show: { 
    opacity: 1, 
    x: 0,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
    }
  },
};

// Fade in animation
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 },
};

// Scale up animation
export const scaleUp = {
  initial: { scale: 0.95, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.95, opacity: 0 },
  transition: { type: "spring", stiffness: 300, damping: 25 },
};

// Pop animation for success states
export const popIn = {
  initial: { scale: 0, opacity: 0 },
  animate: { 
    scale: 1, 
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 15,
    }
  },
  exit: { scale: 0, opacity: 0 },
};

// Slide animations
export const slideInFromLeft = {
  initial: { x: -30, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: -30, opacity: 0 },
  transition: { type: "spring", stiffness: 300, damping: 25 },
};

export const slideInFromRight = {
  initial: { x: 30, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: 30, opacity: 0 },
  transition: { type: "spring", stiffness: 300, damping: 25 },
};

export const slideInFromBottom = {
  initial: { y: 30, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: 30, opacity: 0 },
  transition: { type: "spring", stiffness: 300, damping: 25 },
};

// Card hover animation helper
export const cardHover = {
  rest: { scale: 1 },
  hover: { 
    scale: 1.02,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
    }
  },
  tap: { scale: 0.98 },
};

// List item animation for adding/removing
export const listItemVariants = {
  hidden: { 
    opacity: 0, 
    height: 0,
    marginBottom: 0,
  },
  visible: { 
    opacity: 1, 
    height: "auto",
    marginBottom: 12,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
      opacity: { duration: 0.2 },
    }
  },
  exit: { 
    opacity: 0, 
    height: 0,
    marginBottom: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
      opacity: { duration: 0.2 },
    }
  },
};
