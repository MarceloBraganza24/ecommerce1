import { useState } from "react";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import Spinner from "./Spinner";
import { createCategory, updateCategory, deleteCategory } from "./api";

export default function CategoryNode({ node, onRefresh }) {
  const [showInput, setShowInput] = useState(false);
  const [newName, setNewName] = useState("");
  const [editing, setEditing] = useState(false);
  const [editedName, setEditedName] = useState(node.name);
  const [loading, setLoading] = useState(false);

  // Draggable
  const { attributes, listeners, setNodeRef: dragRef, transform, isDragging } = useDraggable({ id: node._id });
  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    transition: "transform 200ms ease, opacity 200ms ease",
  };

  // Droppable
  const { setNodeRef: dropRef, isOver } = useDroppable({ id: node._id });
  const combinedRef = (el) => { dragRef(el); dropRef(el); };

  const handleCreateSub = async () => {
    if (!newName) return alert("Ingresa un nombre");
    setLoading(true);
    try {
      await createCategory({ name: newName, parent: node._id });
      setNewName(""); setShowInput(false); onRefresh();
    } catch (err) { alert(err.message); }
    finally { setLoading(false); }
  };

  const handleUpdate = async () => {
    if (!editedName) return alert("Ingresa un nombre");
    setLoading(true);
    try { await updateCategory({ id: node._id, name: editedName }); setEditing(false); onRefresh(); }
    catch (err) { alert(err.message); } 
    finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!confirm("¿Seguro que querés eliminar esta categoría?")) return;
    setLoading(true);
    try { await deleteCategory(node._id); onRefresh(); }
    catch (err) { alert(err.message); }
    finally { setLoading(false); }
  };

  return (
    <li ref={combinedRef} style={{ ...style, listStyle: "none", margin: "0.5rem 0", border: isOver ? "2px dashed #007BFF" : "1px solid #ccc", borderRadius: "4px", padding: "0.5rem" }}>
      <div {...attributes} {...listeners} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        {editing ? (
          <>
            <input value={editedName} onChange={(e) => setEditedName(e.target.value)} />
            <button onClick={handleUpdate} disabled={loading}>{loading ? <Spinner /> : "Guardar"}</button>
            <button onClick={() => setEditing(false)}>Cancelar</button>
          </>
        ) : (
          <>
            <span>{node.name}</span>
            <button onClick={() => setShowInput(!showInput)}>+ Subcategoría</button>
            <button onClick={() => setEditing(true)}>Editar</button>
            <button onClick={handleDelete}>Eliminar</button>
          </>
        )}
      </div>

      {showInput && (
        <div style={{ marginLeft: "1rem", marginTop: "0.3rem" }}>
          <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nombre subcategoría" />
          <button onClick={handleCreateSub} disabled={loading}>{loading ? <Spinner /> : "Crear"}</button>
        </div>
      )}

      {node.children?.length > 0 && (
        <ul style={{ paddingLeft: "1rem" }}>
          {node.children.map(child => (
            <CategoryNode key={child._id} node={child} onRefresh={onRefresh} />
          ))}
        </ul>
      )}
    </li>
  );
}
