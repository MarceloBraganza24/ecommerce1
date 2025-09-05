import { useState, useEffect } from "react";
import AddCategoryForm from "./AddCategoryForm.jsx";
import CategoryTree from "./CategoryTree";

export default function CategoriesPage() {
  const [categoriesTree, setCategoriesTree] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
    const SERVER_URL = "http://localhost:8081";

  const fetchCategories = async () => {
    const res = await fetch(`${SERVER_URL}/api/categories/combined`);
    const data = await res.json();
    setCategoriesTree(data.tree);
    setAllCategories(data.flat);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que querés eliminar esta categoría?")) return;
    await fetch(`${SERVER_URL}/api/categories/${id}`, { method: "DELETE" });
    fetchCategories();
  };

  const handleEdit = async (id, formData) => {
    await fetch(`${SERVER_URL}/api/categories/${id}`, {
      method: "PUT",
      body: formData, // ✅ ahora se envía como multipart/form-data
    });
    fetchCategories();
  };

  const handleCreate = async (formData) => {
    await fetch(`${SERVER_URL}/api/categories`, {
      method: "POST",
      body: formData, // ✅ ahora va FormData
    });
    fetchCategories();
  };

  return (
    <div style={{ padding: "20px" }}>
      <AddCategoryForm categories={categoriesTree} onCreate={handleCreate} />
      <h2>Listado</h2>
      <CategoryTree
        categories={categoriesTree}
        onDelete={handleDelete}
        onEdit={handleEdit}
      />
    </div>
  );
}
