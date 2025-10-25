import { useState, useEffect } from "react";

export default function CategorySidebar({ onSelectCategory }) {
  const [categoriesTree, setCategoriesTree] = useState([]);
  const SERVER_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${SERVER_URL}api/categories/combined`);
        const data = await res.json();
        if (res.ok) setCategoriesTree(data.payload || []);
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
    <div className="productsContainer__gridCategoriesProducts__categoriesContainer__categories__tree">
      <div className="productsContainer__gridCategoriesProducts__categoriesContainer__categories__tree__title">Categorías</div>
      <CategoryTree categories={categoriesTree} onSelect={handleSelectCategory} />
    </div>
  );
}

function CategoryTree({ categories, onSelect, level = 0 }) {
  return (
    <ul className="productsContainer__gridCategoriesProducts__categoriesContainer__categories__tree__ul" style={{ listStyle: "none", paddingLeft: level * 25, paddingTop: '0.3vh', cursor:'pointer' }}>
      {categories.map(cat => (
        <CategoryNode key={cat._id} category={cat} onSelect={onSelect} level={level} />
      ))}
    </ul>
  );
}

const capitalizeFirstLetter = (text) => {
    return text.charAt(0).toUpperCase() + text.slice(1);
};

function CategoryNode({ category, onSelect, level }) {
  //console.log(category)
  const [expanded, setExpanded] = useState(false);

  return (
    <li className="productsContainer__gridCategoriesProducts__categoriesContainer__categories__tree__ul__li">
      <div
      className="productsContainer__gridCategoriesProducts__categoriesContainer__categories__tree__ul__li__category"
        style={{
          fontWeight: level === 0 ? "bold" : "normal",
        }}
        onClick={() => onSelect(category)}
      >
        {category.children.length > 0 && (
          <span
          className="productsContainer__gridCategoriesProducts__categoriesContainer__categories__tree__ul__li__subCategory"
            onClick={e => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            style={{
              display: "inline-block",
              width: "16px",
              textAlign: "center",
              marginRight: "4px",
              transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
              transition: "transform 0.2s"
            }}
          >
            ▶
          </span>
        )}
        {capitalizeFirstLetter(category.name)} ({category.productCount})
      </div>

      {expanded && category.children.length > 0 && (
        <CategoryTree categories={category.children} onSelect={onSelect} level={level + 1} />
      )}
    </li>
  );
}
