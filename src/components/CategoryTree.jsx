/* import { useState, useEffect } from "react";

function CategoryTree({ categories, onEdit, onDelete }) {
  return (
    <ul>
      {categories.map(cat => (
        <CategoryNode
          key={cat._id}
          category={cat}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}

function CategoryNode({ category, onEdit, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState(category.name);
  const [newParent, setNewParent] = useState(category.parent || "");
  const [optionsTree, setOptionsTree] = useState([]);
    const SERVER_URL = "http://localhost:8081";

  // 👇 cargamos árbol con deshabilitados desde backend
  useEffect(() => {
    if (editing) {
      fetch(`${SERVER_URL}/api/categories/tree-for-edit/${category._id}`)
        .then(res => res.json())
        .then(data => setOptionsTree(data));
    }
  }, [editing, category._id]);

  const handleSave = () => {
    onEdit(category._id, { name: newName, parent: newParent || null });
    setEditing(false);
  };

  const renderOptions = (cats, prefix = "") =>
    cats.map(cat => (
      <>
        <option
          key={cat._id}
          value={cat._id}
          disabled={cat.disabled}
        >
          {prefix + cat.name}
        </option>
        {renderOptions(cat.children, prefix + "-- ")}
      </>
    ));

  return (
    <li style={{ marginBottom: "5px" }}>
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
          <button onClick={handleSave}>💾</button>
          <button onClick={() => setEditing(false)}>❌</button>
        </>
      ) : (
        <>
          {category.name}
          <button onClick={() => setEditing(true)}>✏️</button>
          <button onClick={() => onDelete(category._id)}>🗑️</button>
        </>
      )}

      {category.children.length > 0 && (
        <CategoryTree
          categories={category.children}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}
    </li>
  );
}

export default CategoryTree;
 */
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
  const [optionsTree, setOptionsTree] = useState([]);
  const SERVER_URL = "http://localhost:8081";

  useEffect(() => {
    if (editing) {
      fetch(`${SERVER_URL}/api/categories/tree-for-edit/${category._id}`)
        .then(res => res.json())
        .then(data => setOptionsTree(data));
    }
  }, [editing, category._id]);

  const handleSave = () => {
    onEdit(category._id, { name: newName, parent: newParent || null });
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
            <button onClick={handleSave}>💾</button>
            <button onClick={() => setEditing(false)}>❌</button>
          </>
        ) : (
          <>
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