import { useState } from "react";

export default function AddCategoryForm({ categories, onCreate }) {
  const [name, setName] = useState("");
  const [parent, setParent] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

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
    setPreview(null);
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

    const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setImage(file);
        setPreview(URL.createObjectURL(file)); // preview temporal
      }
    };

  return (
    <form className="cPanelContainer__categoriesManagement__addCategoryForm" onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
      <div className="cPanelContainer__categoriesManagement__addCategoryForm__input">
        <input
          className="cPanelContainer__categoriesManagement__addCategoryForm__input__prop"
          placeholder="Nombre de categoría"
          value={name}
          onChange={e => setName(e.target.value)}
          />
      </div>
      <div className="cPanelContainer__categoriesManagement__addCategoryForm__select">
        <select
          className="cPanelContainer__categoriesManagement__addCategoryForm__select__prop"
          value={parent}
          onChange={e => setParent(e.target.value)}
          >
          <option value="">Categoría raíz</option>
          {renderOptions(categories)}
        </select>
      </div>
      {!parent && (
        <>
          <div className="cPanelContainer__categoriesManagement__addCategoryForm__inputFileImg">
            <input
              className="cPanelContainer__categoriesManagement__addCategoryForm__inputFileImg__input"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
            {preview && (
              <div className="cPanelContainer__categoriesManagement__addCategoryForm__inputFileImg__img">
                <div className="cPanelContainer__categoriesManagement__addCategoryForm__inputFileImg__img__label">Imagen</div>
                <img
                  className="cPanelContainer__categoriesManagement__addCategoryForm__inputFileImg__img__prop"
                  src={preview}
                  alt="Preview"
                  />
              </div>
            )}
          </div>
        </>
      )}
      <button className="cPanelContainer__categoriesManagement__addCategoryForm__btn" type="submit">➕ Crear</button>
    </form>
  );
}
