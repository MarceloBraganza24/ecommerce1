import { useState, useEffect } from "react";
import { toast } from "react-toastify";

export default function BillingInfoForm({ userId }) {
    const SERVER_URL = import.meta.env.VITE_API_URL;
  const [form, setForm] = useState({
    businessName: "",
    cuit: "",
    ivaCondition: "Monotributista",
    email: "",
    phone: "",
    logoUrl: "",
    branches: [
      { name: "", puntoVenta: "0001", address: { street: "", number: "", city: "", province: "", postalCode: "" } }
    ],
    activeBranch: "0001"
  });

  useEffect(() => {
    fetch(`${SERVER_URL}api/billing-info/${userId}`)
      .then(res => res.json())
      .then(data => {
        if (data) {
          setForm(prevForm => ({
            ...prevForm,
            ...data,
            branches: Array.isArray(data.branches) && data.branches.length
              ? data.branches
              : [
                  {
                    name: "",
                    puntoVenta: "0001",
                    address: {
                      street: "",
                      number: "",
                      city: "",
                      province: "",
                      postalCode: ""
                    }
                  }
                ],
            activeBranch: data.activeBranch || "0001"
          }));
        }
      })
      .catch(err => console.error("Error cargando datos fiscales:", err));
  }, [userId]);

  const handleChange = (path, value, index, subpath) => {
    if (path === "ivaCondition" && (value === "Monotributista" || value === "Consumidor Final")) {
      setForm(prev => ({ ...prev, ivaCondition: value, iibb: "" }));
      return;
    }
    if (typeof index !== "undefined") {
      const newBranches = [...form.branches];
      if (subpath) {
        newBranches[index].address[subpath] = value;
      } else {
        newBranches[index][path] = value;
      }
      setForm({ ...form, branches: newBranches });
    } else {
      setForm({ ...form, [path]: value });
    }
  };

  const addBranch = () => {
    setForm({
      ...form,
      branches: [...form.branches, { name: "", puntoVenta: "", address: { street: "", number: "", city: "", province: "", postalCode: "" } }]
    });
  };

  const removeBranch = (index) => {
    const newBranches = form.branches.filter((_, i) => i !== index);
    setForm({ ...form, branches: newBranches });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, userId: userId };

    const res = await fetch(`${SERVER_URL}api/billing-info`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if(res.ok) {
      toast('Datos fiscales guardados con éxito', {
        position: "top-right",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        className: "custom-toast",
      });
    }
  };

  return (
    <>
        <div className="cPanelContainer__billingFormContainer">

            <div className="cPanelContainer__billingFormContainer__title">Datos fiscales</div>

            <form onSubmit={handleSubmit} className="cPanelContainer__billingFormContainer__form">

                <div className='cPanelContainer__billingFormContainer__form__labelInput'>
                    <div className='cPanelContainer__billingFormContainer__form__labelInput__label'>Razón Social</div>
                    <input className='cPanelContainer__billingFormContainer__form__labelInput__input' placeholder="Razón social" value={form.businessName} onChange={e => handleChange("businessName", e.target.value)} />
                </div>

                <div className='cPanelContainer__billingFormContainer__form__labelInput'>
                    <div className='cPanelContainer__billingFormContainer__form__labelInput__label'>CUIT</div>
                    <input className='cPanelContainer__billingFormContainer__form__labelInput__input' placeholder="CUIT" value={form.cuit} onChange={e => handleChange("cuit", e.target.value)} />
                </div>

                <div className='cPanelContainer__billingFormContainer__form__labelInput'>
                    <div className='cPanelContainer__billingFormContainer__form__labelInput__label'>Condicion de IVA</div>
                    <select className='cPanelContainer__billingFormContainer__form__labelInput__select' value={form.ivaCondition} onChange={e => handleChange("ivaCondition", e.target.value)}>
                        <option value="Monotributista">Monotributista</option>
                        <option value="Responsable Inscripto">Responsable Inscripto</option>
                        <option value="Exento">Exento</option>
                        <option value="Consumidor Final">Consumidor Final</option>
                    </select>
                </div>

                {form.ivaCondition !== "Monotributista" && form.ivaCondition !== "Consumidor Final" && (
                  <div className='cPanelContainer__billingFormContainer__form__labelInput'>
                    <div className='cPanelContainer__billingFormContainer__form__labelInput__label'>Ingresos Brutos (IIBB)</div>
                    <input
                      className='cPanelContainer__billingFormContainer__form__labelInput__input'
                      placeholder="Ingresos Brutos"
                      value={form.iibb || ""}
                      onChange={e => handleChange("iibb", e.target.value)}
                    />
                  </div>
                )}

                <div className='cPanelContainer__billingFormContainer__form__labelInput'>
                    <div className='cPanelContainer__billingFormContainer__form__labelInput__label'>Email</div>
                    <input className='cPanelContainer__billingFormContainer__form__labelInput__input' placeholder="Email" value={form.email} onChange={e => handleChange("email", e.target.value)} />
                </div>

                <div className='cPanelContainer__billingFormContainer__form__labelInput'>
                    <div className='cPanelContainer__billingFormContainer__form__labelInput__label'>Teléfono</div>
                    <input className='cPanelContainer__billingFormContainer__form__labelInput__input' placeholder="Teléfono" value={form.phone} onChange={e => handleChange("phone", e.target.value)} />
                </div>

                <div className='cPanelContainer__billingFormContainer__form__labelInput'>
                    <div className='cPanelContainer__billingFormContainer__form__labelInput__label'>Logo URL</div>
                    <input className='cPanelContainer__billingFormContainer__form__labelInput__input' placeholder="Logo URL" value={form.logoUrl} onChange={e => handleChange("logoUrl", e.target.value)} />
                </div>




                <h3>Sucursales / Puntos de venta</h3>
                <div className="cPanelContainer__billingFormContainer__form__branches">
                    {form.branches?.map((branch, i) => (
                        <div key={i} style={{ border: "1px solid #ccc", padding: "12px", marginBottom: "10px",display:'flex',flexDirection:'column',width:'300px', alignItems:'center' }}>
                            <input className="cPanelContainer__billingFormContainer__form__labelInput__input" placeholder="Nombre sucursal" value={branch.name} onChange={e => handleChange("name", e.target.value, i)} />
                            <input className="cPanelContainer__billingFormContainer__form__labelInput__input" placeholder="Punto de venta" value={branch.puntoVenta} onChange={e => handleChange("puntoVenta", e.target.value, i)} />
                            <input className="cPanelContainer__billingFormContainer__form__labelInput__input" placeholder="Calle" value={branch.address.street} onChange={e => handleChange("address", e.target.value, i, "street")} />
                            <input className="cPanelContainer__billingFormContainer__form__labelInput__input" placeholder="Número" value={branch.address.number} onChange={e => handleChange("address", e.target.value, i, "number")} />
                            <input className="cPanelContainer__billingFormContainer__form__labelInput__input" placeholder="Ciudad" value={branch.address.city} onChange={e => handleChange("address", e.target.value, i, "city")} />
                            <input className="cPanelContainer__billingFormContainer__form__labelInput__input" placeholder="Provincia" value={branch.address.province} onChange={e => handleChange("address", e.target.value, i, "province")} />
                            <input className="cPanelContainer__billingFormContainer__form__labelInput__input" placeholder="Código postal" value={branch.address.postalCode} onChange={e => handleChange("address", e.target.value, i, "postalCode")} />
                            <button className="cPanelContainer__billingFormContainer__form__btn" type="button" onClick={() => removeBranch(i)}>Eliminar sucursal</button>
                        </div>
                    ))}
                </div>

                <button className="cPanelContainer__billingFormContainer__form__btn" type="button" onClick={addBranch}>Agregar sucursal</button>

                <h4>Sucursal activa</h4>
                <select className="cPanelContainer__billingFormContainer__form__labelInput__selectActiveBranch" value={form.activeBranch} onChange={e => handleChange("activeBranch", e.target.value)}>
                    {form.branches?.map((b, i) => (
                        <option key={i} value={b.puntoVenta}>{b.name} ({b.puntoVenta})</option>
                    ))}
                </select>

                <button className="cPanelContainer__billingFormContainer__form__btnSubmit" type="submit">Guardar</button>

            </form>

        </div>
    </>
  );
}
