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
  const [expanded, setExpanded] = useState(false); // estado para abrir/cerrar hijos
  const [newName, setNewName] = useState(category.name);
  const [newParent, setNewParent] = useState(category.parent || "");
  const [newImage, setNewImage] = useState(null); 
  const [preview, setPreview] = useState(null);
  const [optionsTree, setOptionsTree] = useState([]);
  const SERVER_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (editing) {
      fetch(`${SERVER_URL}/api/categories/tree-for-edit/${category._id}`)
        .then(res => res.json())
        .then(data => setOptionsTree(data));
    }
  }, [editing, category._id]);

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
                {(preview || category.image) && (
                  <img
                    src={preview || `${SERVER_URL}${category.image}`}
                    alt={category.name}
                    style={{
                      width: "30px",
                      height: "30px",
                      marginRight: "8px",
                      objectFit: "cover",
                      borderRadius: "4px"
                    }}
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setNewImage(file);
                      setPreview(URL.createObjectURL(file)); // 👈 preview temporal
                    }
                  }}
                  style={{ marginRight: "5px" }}
                />
              </>
            )}

            <button style={{margin:'0vh 1vh', cursor:'pointer'}} onClick={handleSave}>💾</button>
            <button onClick={() => setEditing(false)}>❌</button>
          </>
        ) : (
          <>
            {category.image && (
              <img 
                src={category.image} 
                alt={category.name} 
                style={{ width: "30px", height: "30px", marginRight: "8px", objectFit: "cover", borderRadius: "4px" }}
              />
            )}
            {category.name}
            <button style={{margin:'0vh 1vh', cursor:'pointer'}} onClick={() => setEditing(true)}>✏️</button>
            <button onClick={() => onDelete(category)}>🗑️</button>
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