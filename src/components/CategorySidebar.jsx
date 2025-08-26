/* import { useState, useEffect } from "react";

export default function CategorySidebar({ onSelectCategory }) {
  const [categoriesTree, setCategoriesTree] = useState([]);
  const SERVER_URL = "http://localhost:8081";

  useEffect(() => {
    const fetchCategories = async () => {
      const res = await fetch(`${SERVER_URL}/api/categories/combined`);
      const data = await res.json();
      setCategoriesTree(data.tree);
    };
    fetchCategories();
  }, []);

  return (
    <div style={{ padding: "10px" }}>
      <h3>Categorías</h3>
      <CategoryTree categories={categoriesTree} onSelect={onSelectCategory} />
    </div>
  );
}

function CategoryTree({ categories, onSelect, level = 0 }) {
  return (
    <ul style={{ listStyle: "none", paddingLeft: level * 15 }}>
      {categories.map(cat => (
        <CategoryNode
          key={cat._id}
          category={cat}
          onSelect={onSelect}
          level={level}
        />
      ))}
    </ul>
  );
}

function CategoryNode({ category, onSelect, level }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <li>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          cursor: "pointer",
          fontWeight: level === 0 ? "bold" : "normal"
        }}
        onClick={() => onSelect(category)}
      >
        {category.children.length > 0 && (
          <span
            onClick={e => {
              e.stopPropagation(); // evitar que se dispare onSelect
              setExpanded(!expanded);
            }}
            style={{
              display: "inline-block",
              width: "16px",
              textAlign: "center",
              marginRight: "5px",
              transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
              transition: "transform 0.2s"
            }}
          >
            ▶
          </span>
        )}
        {category.name}
      </div>

      {expanded && category.children.length > 0 && (
        <CategoryTree
          categories={category.children}
          onSelect={onSelect}
          level={level + 1}
        />
      )}
    </li>
  );
}
 */

import { useState, useEffect } from "react";

export default function CategorySidebar({ onSelectCategory }) {
  const [categoriesTree, setCategoriesTree] = useState([]);
  //console.log(categoriesTree)
  const SERVER_URL = "http://localhost:8081";

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${SERVER_URL}/api/categories/combined`);
        const data = await res.json();
        if (res.ok) setCategoriesTree(data.tree || []);
      } catch (err) {
        console.error("Error al cargar categorías:", err);
      }
    };
    fetchCategories();
  }, []);

  const handleSelectCategory = (category) => {
    onSelectCategory(category);
  };

  return (
    <div style={{ padding: "10px" }}>
      <h3>Categorías</h3>
      <CategoryTree categories={categoriesTree} onSelect={handleSelectCategory} />
    </div>
  );
}

function CategoryTree({ categories, onSelect, level = 0 }) {
  return (
    <ul style={{ listStyle: "none", paddingLeft: level * 15 }}>
      {categories.map(cat => (
        <CategoryNode key={cat._id} category={cat} onSelect={onSelect} level={level} />
      ))}
    </ul>
  );
}

function CategoryNode({ category, onSelect, level }) {
  //console.log(category)
  const [expanded, setExpanded] = useState(false);

  return (
    <li>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          cursor: "pointer",
          fontWeight: level === 0 ? "bold" : "normal"
        }}
        onClick={() => onSelect(category)}
      >
        {category.children.length > 0 && (
          <span
            onClick={e => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            style={{
              display: "inline-block",
              width: "16px",
              textAlign: "center",
              marginRight: "5px",
              transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
              transition: "transform 0.2s"
            }}
          >
            ▶
          </span>
        )}
        {category.name} ({category.productCount})
      </div>

      {expanded && category.children.length > 0 && (
        <CategoryTree categories={category.children} onSelect={onSelect} level={level + 1} />
      )}
    </li>
  );
}
