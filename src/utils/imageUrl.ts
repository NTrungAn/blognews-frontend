export const getImageUrl = (url?: string | null): string => {
  if (!url) return '';
  // Nếu là URL tuyệt đối hoặc blob URL thì giữ nguyên
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) {
    return url;
  }
  // Loại bỏ hậu tố /api nếu có để lấy domain gốc
  const apiBase = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api';
  const baseUrl = apiBase.replace('/api', '');
  
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};
