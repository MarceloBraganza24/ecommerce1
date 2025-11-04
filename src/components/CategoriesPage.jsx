import { useState, useEffect } from "react";
import AddCategoryForm from "./AddCategoryForm.jsx";
import CategoryTree from "./CategoryTree";
import ConfirmationDeleteCPanelCategoryModal from "./ConfirmationDeleteCPanelCategoryModal.jsx";

export default function CategoriesPage() {
  const [categoriesTree, setCategoriesTree] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [showConfirmationDeleteCPanelCategoryModal, setShowConfirmationDeleteCPanelCategoryModal] = useState(false);
  const SERVER_URL = import.meta.env.VITE_API_URL;

  const fetchCategories = async () => {
    const res = await fetch(`${SERVER_URL}api/categories/combined`);
    const data = await res.json();
    setCategoriesTree(data.payload);
    setAllCategories(data.flat);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id) => {
    setCategoryId(id)
    setShowConfirmationDeleteCPanelCategoryModal(true)
  };

  const handleEdit = async (id, formData) => {
    await fetch(`${SERVER_URL}api/categories/${id}`, {
      method: "PUT",
      body: formData, // ✅ ahora se envía como multipart/form-data
    });
    fetchCategories();
  };

  const handleCreate = async (formData) => {
    await fetch(`${SERVER_URL}api/categories`, {
      method: "POST",
      body: formData, // ✅ ahora va FormData
    });
    fetchCategories();
  };

  return (
    <>
      <div style={{ padding: "20px 10px" }}>
        <AddCategoryForm categories={categoriesTree} onCreate={handleCreate} />
        <h3>Listado</h3>
        <CategoryTree
          categories={categoriesTree}
          onDelete={handleDelete}
          onEdit={handleEdit}
          />
      </div>
      {
        showConfirmationDeleteCPanelCategoryModal &&
        <ConfirmationDeleteCPanelCategoryModal
        fetchCategories={fetchCategories}
        setShowConfirmationDeleteCPanelCategoryModal={setShowConfirmationDeleteCPanelCategoryModal}
        categoryId={categoryId}
        />
      }

    </>
  );
}
