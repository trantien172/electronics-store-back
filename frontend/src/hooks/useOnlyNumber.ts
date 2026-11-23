import { useCallback, useMemo, useState } from "react";

export const useOnlyNumber = (initialValue = "") => {
  const [value, setValue] = useState(() => initialValue.replace(/\D/g, "").slice(0, 10));
  const [error, setError] = useState<string | null>(null);

  const onChange = useCallback((rawValue: string) => {
    const digits = rawValue.replace(/\D/g, "").slice(0, 10);
    if (digits && !digits.startsWith("0")) {
      setError("Số điện thoại phải bắt đầu bằng số 0");
      return;
    }

    setValue(digits);
    setError(null);
  }, []);

  const isValid = useMemo(() => !error && /^0\d{9}$/.test(value), [error, value]);

  return { value, onChange, error, isValid };
};
