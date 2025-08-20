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

  const handleEdit = async (id, updateData) => {
    await fetch(`${SERVER_URL}/api/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updateData),
    });
    fetchCategories();
  };

  const handleCreate = async (data) => {
    await fetch(`${SERVER_URL}/api/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
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
