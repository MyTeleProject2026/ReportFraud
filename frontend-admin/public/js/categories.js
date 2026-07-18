// Admin Categories

let currentPage = 1;
const limit = 20;

document.addEventListener('DOMContentLoaded', () => {
  // Verify admin
  const token = localStorage.getItem('adminToken');
  if (!token) {
    window.location.href = '/';
    return;
  }
  
  // Set admin user
  const userData = localStorage.getItem('adminUser');
  if (userData) {
    const user = JSON.parse(userData);
    document.getElementById('adminUser').innerHTML = `<i class="fas fa-user-circle"></i> ${user.username}`;
  }
  
  // Load categories
  loadCategories();
  
  // Setup add category form
  document.getElementById('addCategoryForm').addEventListener('submit', handleAddCategory);
  
  // Setup edit modal
  document.getElementById('editCategoryForm').addEventListener('submit', handleEditCategory);
  document.querySelector('.modal-close').addEventListener('click', () => {
    document.getElementById('editModal').style.display = 'none';
  });
  window.addEventListener('click', (e) => {
    if (e.target === document.getElementById('editModal')) {
      document.getElementById('editModal').style.display = 'none';
    }
  });
  
  // Setup logout
  document.getElementById('logoutBtn').addEventListener('click', handleLogout);
  
  // Sidebar toggle
  document.getElementById('sidebarToggle').addEventListener('click', () => {
    document.querySelector('.admin-sidebar').classList.toggle('open');
  });
});

async function loadCategories() {
  try {
    const response = await API.getCategories();
    if (response.success) {
      renderCategories(response.data);
    }
  } catch (error) {
    console.error('Failed to load categories:', error);
    document.getElementById('categoriesBody').innerHTML = `
            <tr><td colspan="6" class="text-center">Failed to load categories</td></tr>
        `;
  }
}

function renderCategories(categories) {
  const tbody = document.getElementById('categoriesBody');
  
  if (!categories || categories.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center">No categories found</td></tr>';
    return;
  }
  
  tbody.innerHTML = categories.map(cat => `
        <tr>
            <td>${cat.id}</td>
            <td><strong>${cat.name}</strong></td>
            <td>${cat.description || '—'}</td>
            <td>${cat.display_order || 0}</td>
            <td>
                <span class="status-badge ${cat.is_active ? 'resolved' : 'rejected'}">
                    ${cat.is_active ? 'Active' : 'Inactive'}
                </span>
            </td>
            <td>
                <button class="btn btn-primary btn-sm edit-category" data-id="${cat.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-sm delete-category" data-id="${cat.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
  
  // Edit handlers
  tbody.querySelectorAll('.edit-category').forEach(btn => {
    btn.addEventListener('click', () => openEditModal(btn.dataset.id));
  });
  
  // Delete handlers
  tbody.querySelectorAll('.delete-category').forEach(btn => {
    btn.addEventListener('click', () => handleDeleteCategory(btn.dataset.id));
  });
}

async function handleAddCategory(e) {
  e.preventDefault();
  
  const name = document.getElementById('newCategoryName').value.trim();
  const description = document.getElementById('newCategoryDescription').value.trim();
  const display_order = parseInt(document.getElementById('newCategoryOrder').value) || 0;
  
  if (!name) {
    alert('Category name is required.');
    return;
  }
  
  const submitBtn = e.target.querySelector('button[type="submit"]');
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
  submitBtn.disabled = true;
  
  try {
    const response = await API.createCategory({ name, description, display_order, is_active: 1 });
    if (response.success) {
      document.getElementById('newCategoryName').value = '';
      document.getElementById('newCategoryDescription').value = '';
      document.getElementById('newCategoryOrder').value = '0';
      await loadCategories();
      alert('Category added successfully!');
    } else {
      alert(response.message || 'Failed to add category.');
    }
  } catch (error) {
    console.error('Add category error:', error);
    alert('An error occurred while adding the category.');
  } finally {
    submitBtn.innerHTML = '<i class="fas fa-plus"></i> Add';
    submitBtn.disabled = false;
  }
}

async function openEditModal(id) {
  try {
    const response = await API.getCategories();
    if (response.success) {
      const category = response.data.find(c => c.id == id);
      if (category) {
        document.getElementById('editCategoryId').value = category.id;
        document.getElementById('editCategoryName').value = category.name;
        document.getElementById('editCategoryDescription').value = category.description || '';
        document.getElementById('editCategoryOrder').value = category.display_order || 0;
        document.getElementById('editCategoryStatus').value = category.is_active ? '1' : '0';
        document.getElementById('editModal').style.display = 'flex';
      }
    }
  } catch (error) {
    console.error('Failed to load category:', error);
    alert('Failed to load category data.');
  }
}

async function handleEditCategory(e) {
  e.preventDefault();
  
  const id = document.getElementById('editCategoryId').value;
  const name = document.getElementById('editCategoryName').value.trim();
  const description = document.getElementById('editCategoryDescription').value.trim();
  const display_order = parseInt(document.getElementById('editCategoryOrder').value) || 0;
  const is_active = parseInt(document.getElementById('editCategoryStatus').value);
  
  if (!name) {
    alert('Category name is required.');
    return;
  }
  
  const submitBtn = e.target.querySelector('button[type="submit"]');
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
  submitBtn.disabled = true;
  
  try {
    const response = await API.updateCategory(id, { name, description, display_order, is_active });
    if (response.success) {
      document.getElementById('editModal').style.display = 'none';
      await loadCategories();
      alert('Category updated successfully!');
    } else {
      alert(response.message || 'Failed to update category.');
    }
  } catch (error) {
    console.error('Update category error:', error);
    alert('An error occurred while updating the category.');
  } finally {
    submitBtn.innerHTML = 'Update Category';
    submitBtn.disabled = false;
  }
}

async function handleDeleteCategory(id) {
  if (!confirm('Are you sure you want to delete this category? This cannot be undone.')) {
    return;
  }
  
  try {
    const response = await API.deleteCategory(id);
    if (response.success) {
      await loadCategories();
      alert('Category deleted successfully!');
    } else {
      alert(response.message || 'Failed to delete category.');
    }
  } catch (error) {
    console.error('Delete category error:', error);
    alert('An error occurred while deleting the category.');
  }
}

async function handleLogout(e) {
  e.preventDefault();
  try {
    await API.logout();
  } catch (error) {
    // Ignore
  }
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
  window.location.href = '/';
}