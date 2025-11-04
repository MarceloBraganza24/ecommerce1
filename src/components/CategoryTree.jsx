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
    <li style={{ marginBottom: "10px", paddingLeft: level * 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap:'0.5vh' }}>
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
            <div className="cPanelContainer__categoriesManagement__editCategoryContainer">
              <input
                className="cPanelContainer__categoriesManagement__editCategoryContainer__input"
                value={newName}
                onChange={e => setNewName(e.target.value)}
              />

              <div className="cPanelContainer__categoriesManagement__editCategoryContainer__img">

                {(!newParent) && (
                  <>
                    {(preview || category.image) && (
                      <img
                        src={preview || `${category.image}`}
                        alt={category.name}
                        className="cPanelContainer__categoriesManagement__categoryContainer__img" 
                      />
                    )}
                    <input
                    className="cPanelContainer__categoriesManagement__editCategoryContainer__img__input"
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
              </div>
              <div className="cPanelContainer__categoriesManagement__editCategoryContainer__btns">
                <button style={{backgroundColor:'#dddddd', borderRadius:'0.5vh', padding:'0.1vh',margin:'0vh 1vh', cursor:'pointer'}} onClick={handleSave}>💾</button>
                <button style={{backgroundColor:'#dddddd', borderRadius:'0.5vh', padding:'0.1vh', cursor:'pointer'}} onClick={() => setEditing(false)}>❌</button>
              </div>
            </div>
          </>
        ) : (
          <>
            {category.image && (
              <img 
                src={category.image} 
                alt={category.name}
                className="cPanelContainer__categoriesManagement__categoryContainer__img" 
              />
            )}
            <div className="cPanelContainer__categoriesManagement__categoryContainer__name">{category.name}</div>
            <button style={{backgroundColor:'#dddddd', borderRadius:'0.5vh', padding:'0.1vh',margin:'0vh 1vh', cursor:'pointer'}} onClick={() => setEditing(true)}>✏️</button>
            <button style={{backgroundColor:'#dddddd', borderRadius:'0.5vh', padding:'0.1vh', cursor:'pointer'}} onClick={() => onDelete(category)}>🗑️</button>
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