import React, {useState,useRef,useEffect} from 'react'
import { toast } from 'react-toastify';
import Spinner from './Spinner';
import { Link } from 'react-router-dom';

const UpdateProductModal = ({product,setShowUpdateModal,fetchProducts,categories}) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: 0,
        stock: 0,
        state: '',
        category: '',
        images: [],
        camposDinamicos: {}
    });

    const [nuevoCampo, setNuevoCampo] = useState({ key: '', value: '' });

    const fileInputRef = useRef(null);

    useEffect(() => {

        if (product) {
            const imagenesDelBackend = product.images.map((imgPath) => {
                const cleanedPath = imgPath.replace(/\\/g, '/'); // Normaliza la ruta a UNIX style
                return {
                type: 'backend',
                name: cleanedPath.split('/').pop(), // Si necesitás el nombre solo
                url: `http://localhost:8081/${cleanedPath}` // Ruta correcta
                };
            });
      
            setFormData((prev) => ({
                ...prev,
                images: imagenesDelBackend
            }));
            
            const camposExtras = product.camposExtras || {};
            const camposDinamicosNormalizados = Object.entries(camposExtras).reduce((acc, [key, value]) => {
                acc[key.toLowerCase()] = value;
                return acc;
            }, {});
        
            setFormData({
                title: product.title || '',
                description: product.description || '',
                price: product.price || 0,
                stock: product.stock || 0,
                state: product.state || '',
                category: product.category || '',
                images: imagenesDelBackend || [],
                camposDinamicos: camposDinamicosNormalizados
            });
        }


    }, [product]);

    const capitalizeFirstLetter = (text) => {
        return text.charAt(0).toUpperCase() + text.slice(1);
    };

    const handleAddImage = (e) => {
        const files = Array.from(e.target.files);
      
        const nuevasImagenes = files.filter((file) => {
          const yaExiste = formData.images.some((img) => img.name === file.name);
          if (yaExiste) {
            toast(`La imagen "${file.name}" ya existe`, {
              position: "top-right",
              autoClose: 2000,
              theme: "dark",
              className: "custom-toast",
            });
          }
          return !yaExiste;
        }).map((file) => ({
          type: 'file',
          name: file.name,
          url: URL.createObjectURL(file),
          file: file
        }));
      
        setFormData((prevData) => ({
          ...prevData,
          images: [...prevData.images, ...nuevasImagenes]
        }));
      
        // Limpiar el input file para volver a seleccionar si quiere la misma
        e.target.value = null;
    };
      
    const handleRemoveImagen = (index) => {
        setFormData((prevData) => {
            const newImages = [...prevData.images];
            newImages.splice(index, 1);
            return {
            ...prevData,
            images: newImages
            };
        });
    };

    const handleAddCampo = () => {
        const keyTrimmed = nuevoCampo.key.trim();
        const valueTrimmed = nuevoCampo.value.trim();
    
        const regex = /^[A-Za-z0-9 ,]+$/;
        if (!regex.test(keyTrimmed) || !regex.test(valueTrimmed)) {
            toast('Los campos solo deben contener letras, números y espacios.', {
              position: "top-right",
              autoClose: 2000,
              theme: "dark",
              className: "custom-toast",
            });
            return;
        }
    
        if (!keyTrimmed || !valueTrimmed) {
            toast('Los dos campos son requeridos', {
                position: "top-right",
                autoClose: 2000,
                theme: "dark",
                className: "custom-toast",
            });
            return;
        }
    
        const existe = formData.camposDinamicos.hasOwnProperty(keyTrimmed.toLowerCase());
    
        if (existe) {
            toast(`El campo "${keyTrimmed}" ya existe`, {
              position: "top-right",
              autoClose: 2000,
              theme: "dark",
              className: "custom-toast",
            });
            return;
        }
    
        const nuevo = {
            ...formData.camposDinamicos,
            [keyTrimmed.toLowerCase()]: valueTrimmed // Añadir nuevo campo al objeto
        };
    
        setFormData(prev => ({
            ...prev,
            camposDinamicos: nuevo
        }));
    
        setNuevoCampo({ key: '', value: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (!formData.title.trim() || !formData.description.trim() || !formData.price || !formData.stock || !formData.state.trim() || !formData.category.trim()) {
            toast('Debes completar todos los campos', {
                position: "top-right",
                autoClose: 2000,
                theme: "dark",
                className: "custom-toast",
            });
            return;
        }

        if (!formData.images.length) {
            toast('Debes incluir al menos una imagen', {
                position: "top-right",
                autoClose: 2000,
                theme: "dark",
                className: "custom-toast",
            });
            return;
        }
    
        const formToSend  = new FormData();
        formToSend .append('title', formData.title);
        formToSend .append('description', formData.description);
        formToSend .append('price', formData.price);
        formToSend .append('stock', formData.stock);
        formToSend .append('state', formData.state);
        formToSend .append('category', formData.category);

        // En el frontend, convierte el objeto a JSON
        const propiedades = JSON.stringify(formData.camposDinamicos);  // Esto convierte el objeto a JSON

        // Asegúrate de agregarlo al FormData
        formToSend.append('propiedades', propiedades);

        // Imágenes nuevas (solo los File)
        formData.images.forEach((img) => {
            if (img.type === 'file') {
                formToSend.append('images', img.file);
            }
        });
        
        // Imágenes anteriores (solo los nombres, el backend sabrá que ya están)
        const imagenesAnteriores = formData.images
        .filter((img) => img.type === 'backend')
        .map((img) => img.name);

        formToSend.append('imagenesAnteriores', JSON.stringify(imagenesAnteriores));
    
        setLoading(true);
    
        try {
            const res = await fetch(`http://localhost:8081/api/products/${product._id}`, {
                method: 'PUT',
                body: formToSend
            });
            
            const data = await res.json();
            if (res.ok) {
                toast('Has modificado el producto con éxito', {
                    position: "top-right",
                    autoClose: 2000,
                    theme: "dark",
                    className: "custom-toast",
                });
                fetchProducts();
                setShowUpdateModal(false)
            } else {
                toast('No se ha podido modificar el producto, intente nuevamente', {
                    position: "top-right",
                    autoClose: 2000,
                    theme: "dark",
                    className: "custom-toast",
                });
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };
    
    const handleClickUpload = () => {
        if (formData.images.length >= 6) {
          toast('No puedes subir más de 6 imágenes', {
            position: "top-right",
            autoClose: 2000,
            theme: "dark",
            className: "custom-toast",
          });
          return;
        }
      
        fileInputRef.current.click();
    };

    const handleEliminarCampo = (key) => {
        const nuevosCampos = { ...formData.camposDinamicos }; // Copiar el objeto
    
        // Eliminar la propiedad del objeto
        delete nuevosCampos[key.toLowerCase()];
    
        setFormData(prev => ({
            ...prev,
            camposDinamicos: nuevosCampos
        }));
    };

    const handleChangeNuevoCampo = (e) => {
        const { name, value } = e.target;

        const regex = /^[A-Za-z0-9 ,]*$/;
        if (!regex.test(value)) {
            toast('Solo se permiten letras, números y espacios.', {
              position: "top-right",
              autoClose: 2000,
              theme: "dark",
              className: "custom-toast",
            });
            return;
        }

        const maxLength = name === 'key' ? 50 : 100;
        if (value.length > maxLength) {
          toast(`Máximo ${maxLength} caracteres en el campo "${name}"`, {
            position: "top-right",
            autoClose: 2000,
            theme: "dark",
            className: "custom-toast",
          });
          return;
        }
    
        setNuevoCampo(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (

        <>

            <div className='updateProductModalContainer'>

                <div className='updateProductModalContainer__updateProductModal'>

                    <div className='updateProductModalContainer__updateProductModal__btnCloseModal'>
                        <div onClick={()=>setShowUpdateModal(false)} className='updateProductModalContainer__updateProductModal__btnCloseModal__btn'>X</div>
                    </div>

                    <div className='updateProductModalContainer__updateProductModal__propsContainer'>

                        <div className='updateProductModalContainer__updateProductModal__propsContainer__propProductImage'>

                            <div className='updateProductModalContainer__updateProductModal__propsContainer__propProductImage__label'>Imágenes</div>
                            <div className='updateProductModalContainer__updateProductModal__propsContainer__propProductImage__galeryImages'>
                                <div className='updateProductModalContainer__updateProductModal__propsContainer__propProductImage__galeryImages__galeryBtnMaxImg'>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        ref={fileInputRef}
                                        onChange={handleAddImage}
                                        className="mb-2"
                                        style={{display:'none'}}
                                    />
                                    {formData.images.map((img, index) => (
                                        <div key={index} className="updateProductModalContainer__updateProductModal__propsContainer__propProductImage__galeryImages__galeryBtnMaxImg__imgContainer">
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveImagen(index)}
                                                className="updateProductModalContainer__updateProductModal__propsContainer__propProductImage__galeryImages__galeryBtnMaxImg__imgContainer__btnDelete"
                                                >
                                                ×
                                            </button>
                                            <img
                                                src={img.url}
                                                alt={`preview-${index}`}
                                                className="updateProductModalContainer__updateProductModal__propsContainer__propProductImage__galeryImages__galeryBtnMaxImg__imgContainer__prop"
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div className='updateProductModalContainer__updateProductModal__propsContainer__propProductImage__galeryImages__btnAddImageLoadingCount'>
                                    <button
                                        type="button"
                                        onClick={handleClickUpload}
                                        className="updateProductModalContainer__updateProductModal__propsContainer__propProductImage__galeryImages__btnAddImageLoadingCount__btn"
                                        >
                                        Agregar Imágenes
                                    </button>
                                    <p className="updateProductModalContainer__updateProductModal__propsContainer__propProductImage__galeryImages__loadingCount">
                                        {formData.images.length}/6 imágen{formData.images.length !== 1 ? 'es' : ''} cargada{formData.images.length !== 1 ? 's' : ''}.
                                    </p>
                                </div>
                            </div>

                        </div>

                        <div className='updateProductModalContainer__updateProductModal__propsContainer__propProduct'>

                            <div className='updateProductModalContainer__updateProductModal__propsContainer__propProduct__label'>Título</div>
                            <div className='updateProductModalContainer__updateProductModal__propsContainer__propProduct__input'>
                                <input
                                    name='title'
                                    placeholder='Título'
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="updateProductModalContainer__updateProductModal__propsContainer__propProduct__input__prop"
                                    required
                                />
                            </div>

                        </div>

                        <div className='updateProductModalContainer__updateProductModal__propsContainer__propProduct'>

                            <div className='updateProductModalContainer__updateProductModal__propsContainer__propProduct__label'>Descripción</div>
                            <div className='updateProductModalContainer__updateProductModal__propsContainer__propProduct__input'>
                                <input
                                    name='description'
                                    placeholder='Descripción'
                                    type="text"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="updateProductModalContainer__updateProductModal__propsContainer__propProduct__input__prop"
                                    required
                                />
                            </div>

                        </div>

                        <div className='updateProductModalContainer__updateProductModal__propsContainer__propProduct'>

                            <div className='updateProductModalContainer__updateProductModal__propsContainer__propProduct__label'>Precio</div>
                            <div className='updateProductModalContainer__updateProductModal__propsContainer__propProduct__input'>
                                <input
                                    name='price'
                                    placeholder='Precio'
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    className="updateProductModalContainer__updateProductModal__propsContainer__propProduct__input__propShort"
                                    required
                                />
                            </div>

                        </div>

                        <div className='updateProductModalContainer__updateProductModal__propsContainer__propProduct'>

                            <div className='updateProductModalContainer__updateProductModal__propsContainer__propProduct__label'>Stock</div>
                            <div className='updateProductModalContainer__updateProductModal__propsContainer__propProduct__input'>
                                <input
                                    name='stock'
                                    placeholder='Stock'
                                    type="number"
                                    value={formData.stock}
                                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                    className="updateProductModalContainer__updateProductModal__propsContainer__propProduct__input__propShort"
                                    required
                                />
                            </div>

                        </div>

                        <div className='updateProductModalContainer__updateProductModal__propsContainer__propProduct'>

                            <div className='updateProductModalContainer__updateProductModal__propsContainer__propProduct__label'>Estado</div>
                            <div className='updateProductModalContainer__updateProductModal__propsContainer__propProduct__input'>
                                <input
                                    name='state'
                                    placeholder='Estado (ej: nuevo,usado)'
                                    type="text"
                                    value={formData.state}
                                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                    className="updateProductModalContainer__updateProductModal__propsContainer__propProduct__input__prop"
                                    required
                                />
                            </div>

                        </div>

                        <div className='createProductModalContainer__createProductModal__propsContainer__propProduct'>

                            <div className='createProductModalContainer__createProductModal__propsContainer__propProduct__label'>Categoría</div>
                            <div className='createProductModalContainer__createProductModal__propsContainer__propProduct__select'>
                                <select
                                    name='category'
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="createProductModalContainer__createProductModal__propsContainer__propProduct__select__prop"
                                    required
                                >
                                    <option value="">Selecciona una categoría</option>
                                    {categories.map((category) => (
                                        <option key={category._id} value={category.name}>
                                            {capitalizeFirstLetter(category.name)}
                                        </option>
                                    ))}
                                </select>
                                <Link
                                    to={`/cpanel`}
                                    className="createProductModalContainer__createProductModal__propsContainer__propProduct__select__addCategoryLink"
                                    >
                                    Agregar categoría
                                </Link>
                            </div>

                        </div>

                        {Object.entries(formData.camposDinamicos).map(([key, value]) => (
                            <div key={key} className='updateProductModalContainer__updateProductModal__propsContainer__propProduct'>

                                <div className='updateProductModalContainer__updateProductModal__propsContainer__propProduct__label'>{capitalizeFirstLetter(key)}</div>
                                <div className='updateProductModalContainer__updateProductModal__propsContainer__propProduct__input'>
                                    <input
                                        placeholder={key}
                                        type="text"
                                        value={value}
                                        onChange={(e) => {
                                            const updatedCamposDinamicos = {
                                                ...formData.camposDinamicos,
                                                [key]: e.target.value // Actualiza el valor del campo correspondiente
                                            };
                                            setFormData({ ...formData, camposDinamicos: updatedCamposDinamicos });
                                        }}
                                        className="updateProductModalContainer__updateProductModal__propsContainer__propProduct__input__prop"
                                        required
                                    />
                                    <button
                                    type="button"
                                    onClick={() => handleEliminarCampo(key)} // Función para eliminar este campo
                                    className="updateProductModalContainer__updateProductModal__propsContainer__addNewFieldContainer__inputsBtn__btn"
                                    style={{marginLeft:'2vh'}}
                                    >
                                    X
                                    </button>
                                </div>

                            </div>
                        ))}

                        <div className='updateProductModalContainer__updateProductModal__propsContainer__addNewFieldContainer'>

                            <div className="updateProductModalContainer__updateProductModal__propsContainer__addNewFieldContainer__label">Agregar nuevo campo</div>
                            <div className="updateProductModalContainer__updateProductModal__propsContainer__addNewFieldContainer__inputsBtn">
                                <input
                                    type="text"
                                    name="key"
                                    placeholder="Nombre del campo (ej: color)"
                                    value={nuevoCampo.key}
                                    onChange={handleChangeNuevoCampo}
                                    className="updateProductModalContainer__updateProductModal__propsContainer__addNewFieldContainer__inputsBtn__input"
                                />
                                <input
                                    type="text"
                                    name="value"
                                    placeholder="Valor (ej: rojo)"
                                    value={nuevoCampo.value}
                                    onChange={handleChangeNuevoCampo}
                                    className="updateProductModalContainer__updateProductModal__propsContainer__addNewFieldContainer__inputsBtn__input"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddCampo}
                                    className="updateProductModalContainer__updateProductModal__propsContainer__addNewFieldContainer__inputsBtn__btn"
                                >
                                    +
                                </button>
                            </div>

                        </div>

                        <div className='updateProductModalContainer__updateProductModal__propsContainer__btnContainer'>
                            <button disabled={loading} onClick={handleSubmit} className='updateProductModalContainer__updateProductModal__propsContainer__btnContainer__btn'>
                                {loading ? (
                                    <>
                                        Guardando <Spinner />
                                    </>
                                ) : (
                                    'Guardar cambios'
                                )}
                            </button>
                        </div>

                    </div>

                </div>
                
            </div>       
        
        </>

    )

}

export default UpdateProductModal