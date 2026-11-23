import { useState, useEffect } from 'react';

interface PasswordRules {
  isLengthValid: boolean;   // Đủ số lượng ký tự yêu cầu
  hasNumber: boolean;       // Có ít nhất 1 số
  hasSpecialChar: boolean;  // Có ít nhất 1 ký tự đặc biệt
}

// Mặc định nếu không truyền minLength thì sẽ lấy là 8 ký tự
export function usePasswordRules(minLength: number = 8) {
  const [isTouched, setTouched] = useState(false);
  const [password, setPassword] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [rules, setRules] = useState<PasswordRules>({
    isLengthValid: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  useEffect(() => {
    const currentRules = {
      isLengthValid: password.length >= minLength,
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[^A-Za-z0-9]/.test(password), // Bất kỳ ký tự nào không phải chữ và số
    };

    setRules(currentRules);

    // Mật khẩu hợp lệ khi thỏa mãn đồng thời cả 3 điều kiện
    setIsValid(currentRules.isLengthValid && currentRules.hasNumber && currentRules.hasSpecialChar);
  }, [password, minLength]);

  return {
    password,
    setPassword,
    rules,
    isValid, // Biến này dùng để bật/tắt nút Submit cực tiện
    isTouched,
    setTouched,
  };
}