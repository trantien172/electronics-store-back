import { useState, useCallback } from 'react';

interface PhoneRules {
  isLengthValid: boolean; // Đúng 10 số
  startsWithZero: boolean; // Bắt đầu bằng số 0
  isOnlyNumbers: boolean;  // Không chứa chữ hay ký tự lạ
}

export function usePhoneValidator() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [rules, setRules] = useState<PhoneRules>({
    isLengthValid: false,
    startsWithZero: false,
    isOnlyNumbers: false,
  });
  const [error, setErrorState] = useState("")

  const onChange = useCallback((text: string) => {
    // Loại bỏ khoảng trắng nếu người dùng vô tình gõ vào
    setPhoneNumber(text);
    const cleanPhone = text.trim();

    const currentRules = {
      isLengthValid: cleanPhone.length === 10,
      startsWithZero: cleanPhone.startsWith('0'),
      isOnlyNumbers: /^[0-9]*$/.test(cleanPhone),
    };

    setRules(currentRules);

    // Mật mã số điện thoại chỉ hợp lệ khi đạt cả 3 điều kiện cơ bản
    // Bạn có thể thêm điều kiện check đầu số nhà mạng tại đây nếu muốn gắt gao hơn
    setIsValid(
      currentRules.isLengthValid &&
      currentRules.startsWithZero &&
      currentRules.isOnlyNumbers
    );

    if (!currentRules.startsWithZero)
      setError('Phải bắt đầu bằng số 0')

    else if (!currentRules.isOnlyNumbers)
      setError('Phải là số')
    else if(!currentRules.isLengthValid)
      setError('Không đúng độ dài!')
    else
      setError('')
  }, []);

  const setError = useCallback((e: string) => setErrorState(e), [])

  return {
    phoneNumber,
    onChange,
    rules,
    isValid,
    error,
    setError
  };
}