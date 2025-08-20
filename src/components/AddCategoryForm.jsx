import { useState } from "react";

export default function AddCategoryForm({ categories, onCreate }) {
  const [name, setName] = useState("");
  const [parent, setParent] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return alert("El nombre es obligatorio");
    await onCreate({ name, parent: parent || null });
    setName("");
    setParent("");
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
      <button type="submit">➕ Crear</button>
    </form>
  );
}
