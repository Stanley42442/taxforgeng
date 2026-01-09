import { useState, useCallback } from "react";

export type FormState = "idle" | "loading" | "success" | "error";

interface UseFormFeedbackOptions {
  successDuration?: number;
  errorDuration?: number;
  onSuccess?: () => void;
  onError?: () => void;
}

export const useFormFeedback = (options: UseFormFeedbackOptions = {}) => {
  const { 
    successDuration = 3000, 
    errorDuration = 5000, 
    onSuccess, 
    onError 
  } = options;
  
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");
  const [description, setDescription] = useState("");

  const setSuccess = useCallback((msg = "Success!", desc = "") => {
    setMessage(msg);
    setDescription(desc);
    setState("success");
    onSuccess?.();
    
    setTimeout(() => {
      setState("idle");
      setMessage("");
      setDescription("");
    }, successDuration);
  }, [successDuration, onSuccess]);

  const setError = useCallback((msg = "Something went wrong", desc = "") => {
    setMessage(msg);
    setDescription(desc);
    setState("error");
    onError?.();
    
    setTimeout(() => {
      setState("idle");
      setMessage("");
      setDescription("");
    }, errorDuration);
  }, [errorDuration, onError]);

  const setLoading = useCallback(() => {
    setState("loading");
    setMessage("");
    setDescription("");
  }, []);

  const reset = useCallback(() => {
    setState("idle");
    setMessage("");
    setDescription("");
  }, []);

  // Wrapper for async operations with automatic state management
  const handleAsync = useCallback(async <T>(
    operation: () => Promise<T>,
    successMsg?: string,
    successDesc?: string,
    errorMsg?: string
  ): Promise<T | null> => {
    setLoading();
    try {
      const result = await operation();
      setSuccess(successMsg, successDesc);
      return result;
    } catch (error) {
      setError(errorMsg || (error instanceof Error ? error.message : "Something went wrong"));
      return null;
    }
  }, [setLoading, setSuccess, setError]);

  return {
    state,
    message,
    description,
    isIdle: state === "idle",
    isLoading: state === "loading",
    isSuccess: state === "success",
    isError: state === "error",
    setSuccess,
    setError,
    setLoading,
    reset,
    handleAsync,
  };
};
