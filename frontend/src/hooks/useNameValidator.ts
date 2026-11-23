import { useState, useCallback } from 'react';

interface UseVietnameseNameResult {
  value: string;          // Giá trị đã được chuẩn hóa
  error: string | null;   // Thông báo lỗi nếu không hợp lệ
  isValid: boolean;       // Trạng thái hợp lệ
  setError: (text: string) => void;
  onChange: (text: string) => void; // Hàm xử lý khi nhập liệu
}

export const useVietnameseName = (initialValue: string = ''): UseVietnameseNameResult => {
  const [value, setValue] = useState(initialValue);
  const [error, setErrorState] = useState<string | null>(null);

  // Regex hỗ trợ đầy đủ các ký tự tiếng Việt (chữ hoa, chữ thường và dấu)
  const vietnameseRegex = /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯưÀÁẠẢÃÂẦẤẨẪẬĂẰẮẲẴẶÈÉẸẺẼÊỀẾỂỄỆÌÍỊỈĨÒÓỌỎÕÔỒỐỔỖỘƠỜỚỞỠỢÙÚỤỦŨƯỪỨỬỮỰỲÝỴỶỸàáạảãâầấẩẫậăằắẳẵặèéẹẻẽêềếểễệìíịỉĩòóọỏõôồốổỗộơờớởỡợùúụủũưừứửữựỳýỵỷỹ\s]+$/;
  const onChange = useCallback((text: string) => {
    
    if(!text.trim())
    {
      setValue('')
      return
    }
    // 2. Kiểm tra ký tự hợp lệ (chỉ cho phép chữ cái và khoảng trắng)
    if (!vietnameseRegex.test(text.trim())) {
      setValue(text.trim());
      setErrorState('Tên chỉ được chứa chữ cái tiếng Việt và khoảng trắng.');
      return;
    }

    // 3. CHUẨN HÓA BẢN HOÀN CHỈNH:
    const normalized = text                       // Bỏ khoảng trống thừa ở đầu và cuối
      .replace(/\s+/g, ' ')           // Thay thế nhiều khoảng trống ở giữa bằng 1 khoảng trống
      .toLowerCase()                  // Chuyển về chữ thường để chuẩn hóa dễ hơn
      .split(' ')                     // Cắt thành mảng các từ
      .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Viết hoa chữ đầu từng từ
      .join(' ');                     // Gộp lại thành chuỗi

    setValue(normalized);
    setErrorState(null); // Tên hợp lệ, xóa lỗi
  }, []);

 const setError = useCallback((message: string)=>setErrorState(message),[])

  return {
    value,
    error,
    setError,
    isValid: error === null && value.trim() !== '',
    onChange,
  };
};