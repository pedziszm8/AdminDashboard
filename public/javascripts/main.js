function customers() {
    window.location.href="/customers"
}

function users() {
    window.location.href="/users"
}

function products() {
   window.location.href="/products" 
}

function logout() {
    window.location.href="/logout"
}

function addProduct() {
  window.location.href="/addproduct"
}

window.addEventListener('load', () => {
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const carousel = document.querySelector('.scroll-container'); /*tu przed tem było carousel  */

    prevBtn.addEventListener('click', () => {
        carousel.scrollBy({ left: -300, behavior: 'smooth' });
    });

    nextBtn.addEventListener('click', () => {
        carousel.scrollBy({ left: 300, behavior: 'smooth' });
    });
});




window.addEventListener("DOMContentLoaded", function (){
    const scrollContainer = document.querySelector('.scroll-container');
  
    function scrollLeft() {
      if (scrollContainer) {
        scrollContainer.scrollBy({
          left: -200,
          behavior: 'smooth'
        });
      }
    }
  
    function scrollRight() {
      if (scrollContainer) {
        scrollContainer.scrollBy({
          left: 200,
          behavior: 'smooth'
        });
      }
    }
  
    // Przypisz funkcje do przycisków
    document.querySelector('.scroll-button.left').addEventListener('click', scrollLeft);
    document.querySelector('.scroll-button.right').addEventListener('click', scrollRight);
  });
  