import { useState, useEffect } from "react";
function CategoryTree({ categories, onEdit, onDelete, level = 0 }) {
  return (
    <ul style={{ listStyle: "none", paddingLeft: level * 20 + "px" }}>
      {categories.map(cat => (
        <CategoryNode
          key={cat._id}
          category={cat}
          onEdit={onEdit}
          onDelete={onDelete}
          level={level}
        />
      ))}
    </ul>
  );
}

function CategoryNode({ category, onEdit, onDelete, level }) {
  const [editing, setEditing] = useState(false);
  const [expanded, setExpanded] = useState(true); // estado para abrir/cerrar hijos
  const [newName, setNewName] = useState(category.name);
  const [newParent, setNewParent] = useState(category.parent || "");
  const [newImage, setNewImage] = useState(null); 
  const [optionsTree, setOptionsTree] = useState([]);
  const SERVER_URL = "http://localhost:8081";

  useEffect(() => {
    if (editing) {
      fetch(`${SERVER_URL}/api/categories/tree-for-edit/${category._id}`)
        .then(res => res.json())
        .then(data => setOptionsTree(data));
    }
  }, [editing, category._id]);

  /* const handleSave = () => {
    onEdit(category._id, { name: newName, parent: newParent || null });
    setEditing(false);
  }; */
  const handleSave = () => {
    const formData = new FormData();
    formData.append("name", newName);
    if (newParent) formData.append("parent", newParent);
    if (newImage) formData.append("image", newImage); // ✅ incluimos imagen si hay

    onEdit(category._id, formData); // ✅ pasamos FormData
    setEditing(false);
  };

  const renderOptions = (cats, prefix = "") =>
    cats.map(cat => (
      <>
        <option key={cat._id} value={cat._id} disabled={cat.disabled}>
          {prefix + cat.name}
        </option>
        {renderOptions(cat.children, prefix + "-- ")}
      </>
    ));

  return (
    <li style={{ marginBottom: "5px", paddingLeft: level * 20 }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        {/* Flecha para expandir/colapsar */}
        {category.children.length > 0 && (
          <span
            onClick={() => setExpanded(!expanded)}
            style={{
              cursor: "pointer",
              display: "inline-block",
              width: "16px",
              textAlign: "center",
              marginRight: "5px",
              transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
              transition: "transform 0.2s",
            }}
          >
            ▶
          </span>
        )}
        {editing ? (
          <>
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              style={{ marginRight: "5px" }}
            />
            <select
              value={newParent}
              onChange={e => setNewParent(e.target.value)}
              style={{ marginRight: "5px" }}
            >
              <option value="">Categoría raíz</option>
              {renderOptions(optionsTree)}
            </select>

            {(!newParent) && (
              <>
                {category.image && !newImage && (
                  <img
                    src={`http://localhost:8081${category.image}`}
                    alt={category.name}
                    style={{ width: "30px", height: "30px", marginRight: "8px" }}
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewImage(e.target.files[0])}
                  style={{ marginRight: "5px" }}
                />
              </>
            )}

            <button onClick={handleSave}>💾</button>
            <button onClick={() => setEditing(false)}>❌</button>
          </>
        ) : (
          <>
            {category.image && (
              <img 
                src={`http://localhost:8081${category.image}`} 
                alt={category.name} 
                style={{ width: "30px", height: "30px", marginRight: "8px", objectFit: "cover", borderRadius: "4px" }}
              />
            )}
            {category.name}
            <button onClick={() => setEditing(true)}>✏️</button>
            <button onClick={() => onDelete(category._id)}>🗑️</button>
          </>
        )}
      </div>

      {expanded && category.children.length > 0 && (
        <CategoryTree
          categories={category.children}
          onEdit={onEdit}
          onDelete={onDelete}
          level={level + 1}
        />
      )}
    </li>
  );
}


export default CategoryTree;