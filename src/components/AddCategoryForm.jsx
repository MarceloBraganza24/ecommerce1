import { useState } from "react";

export default function AddCategoryForm({ categories, onCreate }) {
  const [name, setName] = useState("");
  const [parent, setParent] = useState("");
  const [image, setImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return alert("El nombre es obligatorio");

    const formData = new FormData();
    formData.append("name", name);
    if (parent) formData.append("parent", parent);
    if (image) formData.append("image", image);

    await onCreate(formData);

    setName("");
    setParent("");
    setImage(null);
    e.target.reset(); 
  };

  const renderOptions = (cats, prefix = "") =>
    cats.map(cat => (
      <>
        <option key={cat._id} value={cat._id}>
          {prefix + cat.name}
        </option>
        {renderOptions(cat.children, prefix + "-- ")}
      </>
    ));

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
      <input
        placeholder="Nombre de categoría"
        value={name}
        onChange={e => setName(e.target.value)}
        style={{ marginRight: "10px" }}
      />
      <select
        value={parent}
        onChange={e => setParent(e.target.value)}
        style={{ marginRight: "10px" }}
      >
        <option value="">Categoría raíz</option>
        {renderOptions(categories)}
      </select>
      {!parent && (
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          style={{ marginRight: "10px" }}
        />
      )}
      <button type="submit">➕ Crear</button>
    </form>
  );
}
