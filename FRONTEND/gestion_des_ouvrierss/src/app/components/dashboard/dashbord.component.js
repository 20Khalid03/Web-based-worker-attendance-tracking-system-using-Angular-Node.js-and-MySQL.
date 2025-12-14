function toggleSidebar() {
  const toggleBtn = document.querySelector('.toggle-btn');
  const sidebar = document.getElementById('sidebar');
  const main = document.querySelector('.main');

  if (toggleBtn) {
    toggleBtn.addEventListener('click', function () {
      sidebar.classList.toggle('collapsed');
      main.classList.toggle('expanded');
      if (sidebar.classList.contains('collapsed')) {
        sidebar.style.transition = 'width 0.3s ease';
      } else {
        sidebar.style.transition = 'width 0.5s ease';
      }
    });
  }
}

function animateCards() {
  const cards = document.querySelectorAll('.indicator-card');

  cards.forEach(card => {
    card.addEventListener('mouseover', function () {
      this.style.transform = 'scale(1.1) rotate(1deg)'; 
      this.style.transition = 'transform 0.4s ease'; 
    });

    card.addEventListener('mouseout', function () {
      this.style.transform = 'scale(1)';
      this.style.transition = 'transform 0.4s ease';
    });
  });
}

function filterTable() {
  const searchInput = document.querySelector('#searchInput');
  const tableRows = document.querySelectorAll('.table tbody tr');

  if (searchInput) {
    searchInput.addEventListener('input', function () {
      const searchTerm = this.value.toLowerCase();

      tableRows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
      });
    });
  }
}

function initSidebarLinks() {
  const sidebarLinks = document.querySelectorAll('.sidebar-link');
  sidebarLinks.forEach(link => {
    link.addEventListener('mouseover', () => {
      link.style.backgroundColor = '#3b7ddd'; 
      link.style.transition = 'background-color 0.3s ease';
    });

    link.addEventListener('mouseout', () => {
      link.style.backgroundColor = '';
    });
  });
}


function animateButtons() {
  const buttons = document.querySelectorAll('.btn');

  buttons.forEach(button => {
    button.addEventListener('mouseover', function() {
      this.style.transform = 'scale(1.1)';
      this.style.transition = 'transform 0.3s ease';
    });

    button.addEventListener('mouseout', function() {
      this.style.transform = 'scale(1)';
    });
  });
}


export { toggleSidebar, animateCards, filterTable,initSidebarLinks,animateButtons };
