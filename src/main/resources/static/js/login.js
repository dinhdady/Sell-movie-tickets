//Điều hương panel
const container = document.getElementById('container');
function togglePanel() {
    const container = document.getElementById('container');
    container.classList.toggle('right-panel-active');
}
function showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.innerHTML = `<div class=" ${type}">${message}</div>`;
    messageDiv.classList.add('show'); // Hiển thị thông báo
    console.log("OK11")
  // Ẩn thông báo sau 3 giây
  setTimeout(() => {
      messageDiv.style.opacity = '0'; // Bắt đầu mờ dần
      // Sau khi mờ dần hoàn tất, ẩn thông báo
      setTimeout(() => {
          messageDiv.style.display = 'none';

      }, 1000); // Đợi 1 giây để hiệu ứng mờ dần hoàn tất
  }, 3000); // Hiển thị thông báo trong 3 giây
}
//load information
document.addEventListener('DOMContentLoaded', function () {
  const urlParams = new URLSearchParams(window.location.search);
    const message = urlParams.get('message');
  if (message) {
      console.log("OK")
      showMessage(message, 'alert');
      // Xóa query parameter sau khi hiển thị
      history.replaceState(null, '', window.location.pathname);
  }
  });
  window.addEventListener('DOMContentLoaded', function () {
    const messageBox = document.getElementById('message');
    if (messageBox) {
        // Fade out sau 5 giây
        setTimeout(() => {
            messageBox.style.transition = "opacity 0.5s ease";
            messageBox.style.opacity = "0";
            setTimeout(() => {
                messageBox.style.display = "none";
            }, 500); // Ẩn sau khi mờ hoàn toàn
        }, 3000);
    }
});
window.addEventListener('DOMContentLoaded', () => {
  const messages = [
      document.getElementById('registerSuccess'),
      document.getElementById('registerExisted'),
      document.getElementById('registerNull'),
      document.getElementById('registerError')
  ];

  messages.forEach(msg => {
      if (msg) {
          setTimeout(() => {
              msg.style.display = 'none';
          }, 5000); // 5 giây
      }
  });
});