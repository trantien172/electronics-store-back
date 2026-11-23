import { useState, useCallback } from 'react';

interface UseEmailResult {
  value: string;          // Giá trị email đã chuẩn hóa
  error: string | null;   // Thông báo lỗi nếu không hợp lệ
  isValid: boolean;       // Trạng thái hợp lệ (true/false)
  onChange: (text: string) => void; // Hàm xử lý khi nhập liệu
}

export const useEmail = (initialValue: string = ''): UseEmailResult => {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);

  // Regex chuẩn RFC 5322 để validate email thông dụng
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const onChange = useCallback((text: string) => {
    // 1. Chuẩn hóa dữ liệu đầu vào (Xóa khoảng trắng và đưa về chữ thường)
    const cleanedEmail = text.trim().toLowerCase();
    setValue(cleanedEmail);

    // 2. Kiểm tra rỗng
    if (!cleanedEmail) {
      setError('Email không được để trống.');
      return;
    }

    // 3. Kiểm tra định dạng bằng Regex
    if (!emailRegex.test(cleanedEmail)) {
      setError('Định dạng email không hợp lệ (Ví dụ: abc@domain.com).');
      return;
    }

    // Nếu hợp lệ thì xóa lỗi
    setError(null);
  }, []);

  return {
    value,
    error,
    isValid: error === null && value !== '',
    onChange,
  };
};