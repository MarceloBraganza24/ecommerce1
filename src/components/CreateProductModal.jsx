import React, {useState,useRef,useEffect,useContext} from 'react'
import { toast } from 'react-toastify';
import Spinner from './Spinner';
import { Link } from 'react-router-dom';
import {ProductsContext} from '../context/CPanelProductsContext'

const CreateProductModal = ({setShowCreateProductModal,categories,fetchProducts}) => {
    const {
        product,
        setProduct,
        nuevoCampo,
        setNuevoCampo,
        variantes,
        setVariantes,
        nuevaVariante,
        setNuevaVariante
    } = useContext(ProductsContext);
    const [loading, setLoading] = useState(false);

    const fileInputRef = useRef(null);

    useEffect(() => {
        return () => {
            product.images.forEach(imagen => URL.revokeObjectURL(imagen));
        };
    }, [product.images]);

    const capitalizeFirstLetter = (text) => {
        return text.charAt(0).toUpperCase() + text.slice(1);
    };
    
    const handleImagenesChange = async (e) => {
        const files = Array.from(e.target.files);
    
        const totalImages = product.images.length + files.length;
    
        if (totalImages > 6) {
            toast(`Máximo 6 imágenes`, {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
                className: "custom-toast",
            });
            return;
        }
    
        const processedImages = [];
    
        for (let file of files) {
            const isDuplicate = product.images.some(imagen => 
                imagen.name === file.name &&
                imagen.lastModified === file.lastModified &&
                imagen.size === file.size
            );
    
            if (isDuplicate) {
                toast(`La imagen ${file.name} ya ha sido cargada.`, {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                    className: "custom-toast",
                });
                continue; // Salta al siguiente archivo
            }
    
            processedImages.push(file);
        }
    
        if (processedImages.length === 0) {
            return;
        }
    
        setProduct(prev => ({
            ...prev,
            images: [...prev.images, ...processedImages]
        }));
        e.target.value = '';
    };

    const handleRemoveImagen = (index) => {
        const nuevasImagenes = [...product.images];
        nuevasImagenes.splice(index, 1);
        setProduct(prev => ({
            ...prev,
            images: nuevasImagenes
        }));
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

        const existe = product.camposDinamicos.some(campo => 
            campo.key.toLowerCase() === keyTrimmed.toLowerCase()
        );
    
        if (!keyTrimmed || !valueTrimmed) {
            toast('Los dos campos son requeridos', {
                position: "top-right",
                autoClose: 2000,
                theme: "dark",
                className: "custom-toast",
            });
            return;
        }
    
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
            key: keyTrimmed,
            value: valueTrimmed
        };
    
        setProduct(prev => ({
            ...prev,
            camposDinamicos: [...prev.camposDinamicos, nuevo]
        }));
    
        setNuevoCampo({ key: '', value: '' });

        setVariantes([])

    };
    

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (
            !product.title.trim() ||
            !product.description.trim() ||
            !product.state.trim()
        ) {
            toast('Debes completar todos los campos correctamente', {
                position: "top-right",
                autoClose: 2000,
                theme: "dark",
                className: "custom-toast",
            });
            return;
        }
        if(nuevoCampo.key != '' || nuevoCampo.value != '') {
            toast('Debes confirmar si quieres agregar un nuevo campo apretando en el boton +', {
                position: "top-right",
                autoClose: 2000,
                theme: "dark",
                className: "custom-toast",
            });
            return;
        }
        if(!product.category) {
            toast('Debes seleccionar una categoría', {
                position: "top-right",
                autoClose: 2000,
                theme: "dark",
                className: "custom-toast",
            });
            return;
        }

        if (!product.images.length) {
            toast('Debes incluir al menos una imagen', {
                position: "top-right",
                autoClose: 2000,
                theme: "dark",
                className: "custom-toast",
            });
            return;
        }
        if (
            product.camposDinamicos.length > 0 &&
            (!Array.isArray(variantes) || variantes.length === 0)
            ) {
            toast('Debes incluir al menos una variante', {
                position: "top-right",
                autoClose: 2000,
                theme: "dark",
                className: "custom-toast",
            });
            return;
        }
    
        const formData = new FormData();
        formData.append('title', product.title);
        formData.append('description', product.description);
        if (variantes.length > 0) {
            formData.append('variantes', JSON.stringify(variantes));
        } else {
            formData.append('price', product.price);
            formData.append('stock', product.stock);
        }
        formData.append('state', product.state);
        formData.append('category', product.category);
    
        const propiedades = {};
        product.camposDinamicos.forEach(campo => {
            propiedades[campo.key] = campo.value;
        });
    
        formData.append('propiedades', JSON.stringify(propiedades));
    
        product.images.forEach(imagen => {
            formData.append('images', imagen);
        });
    
        setLoading(true);
    
        try {
            const res = await fetch('http://localhost:8081/api/products/', {
                method: 'POST',
                body: formData
            });
    
            const data = await res.json();
            //console.log(data)
            if(data.error === 'There is already a product with that title') {
                toast('Ya existe un producto con ese título!', {
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
            } else if (res.ok) {
                toast('Has ingresado el producto con éxito', {
                    position: "top-right",
                    autoClose: 2000,
                    theme: "dark",
                    className: "custom-toast",
                });
                setProduct({
                    images: [],
                    title: '',
                    description: '',
                    price: '',
                    stock: '',
                    category: '',
                    camposDinamicos: []
                });
                fetchProducts();
                setShowCreateProductModal(false);
            } 
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClickUpload = () => {
        fileInputRef.current.click(); // Abre el diálogo de selección de archivos
    };

    const handleEliminarCampo = (index) => {
        const nuevosCampos = product.camposDinamicos.filter((_, i) => i !== index);
    
        setProduct(prev => ({
            ...prev,
            camposDinamicos: nuevosCampos
        }));
    };

    const handleValueChange = (index, newValue) => {
        const regex = /^[A-Za-z0-9 ,]*$/;
        if (!regex.test(newValue)) {
            toast('Solo se permiten letras, números y espacios.', {
              position: "top-right",
              autoClose: 2000,
              theme: "dark",
              className: "custom-toast",
            });
            return;
        }

        if (newValue.length > 100) {
            toast('Máximo 100 caracteres en el valor del campo.', {
              position: "top-right",
              autoClose: 2000,
              theme: "dark",
              className: "custom-toast",
            });
            return;
        }

        const nuevosCampos = [...product.camposDinamicos];
        nuevosCampos[index].value = newValue;
    
        setProduct(prev => ({
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

    const handleBtnAddVariant = () => {
        const campos = nuevaVariante.campos;

        // Validación: asegurarse de que todos los campos estén completos
        const camposIncompletos = product.camposDinamicos.some((campo, idx) => {
            const key = campo.key;
            if (product.camposDinamicos.findIndex(c => c.key === key) !== idx) return false; // ignorar duplicados
            return !campos[key];
        });

        if (camposIncompletos || nuevaVariante.stock <= 0 || nuevaVariante.price <= 0) {
            toast('Completá todos los campos de la variante y asigná un stock válido.', {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
                className: "custom-toast",
            });
            return;
        }

        // Validación: evitar duplicados
        const varianteYaExiste = variantes.some(v => {
            const keys1 = Object.keys(v.campos);
            const keys2 = Object.keys(campos);
            if (keys1.length !== keys2.length) return false;
            return keys1.every(k => v.campos[k] === campos[k]);
        });

        if (varianteYaExiste) {
            toast('Esa combinación de variante ya fue agregada.', {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
                className: "custom-toast",
            });
            return;
        }

        // Si pasa las validaciones, agregar
        setVariantes([...variantes, nuevaVariante]);
        setNuevaVariante({ campos: {}, price: '', stock: '' });
    }

    return (

        <>

            <div className='createProductModalContainer'>

                <div className='createProductModalContainer__createProductModal'>

                    <div className='createProductModalContainer__createProductModal__btnCloseModal'>
                        <div onClick={()=>setShowCreateProductModal(false)} className='createProductModalContainer__createProductModal__btnCloseModal__btn'>X</div>
                    </div>

                    <div className='createProductModalContainer__createProductModal__title'>
                        <div className='createProductModalContainer__createProductModal__title__prop'>Crear producto</div>
                    </div>

                    <div className='createProductModalContainer__createProductModal__propsContainer'>

                        <div className='createProductModalContainer__createProductModal__propsContainer__propProductImage'>

                            <div className='createProductModalContainer__createProductModal__propsContainer__propProductImage__label'>Imágenes</div>
                            <div className='createProductModalContainer__createProductModal__propsContainer__propProductImage__galeryImages'>
                                <div className='createProductModalContainer__createProductModal__propsContainer__propProductImage__galeryImages__galeryBtnMaxImg'>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        ref={fileInputRef}
                                        onChange={handleImagenesChange}
                                        className="mb-2"
                                        style={{display:'none'}}
                                    />
                                    {product.images.map((img, index) => (
                                        <div key={index} className="createProductModalContainer__createProductModal__propsContainer__propProductImage__galeryImages__galeryBtnMaxImg__imgContainer">
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveImagen(index)}
                                                className="createProductModalContainer__createProductModal__propsContainer__propProductImage__galeryImages__galeryBtnMaxImg__imgContainer__btnDelete"
                                                >
                                                ×
                                            </button>
                                            <img
                                                src={URL.createObjectURL(img)}
                                                alt={`preview-${index}`}
                                                className="createProductModalContainer__createProductModal__propsContainer__propProductImage__galeryImages__galeryBtnMaxImg__imgContainer__prop"
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div className='createProductModalContainer__createProductModal__propsContainer__propProductImage__galeryImages__btnAddImageLoadingCount'>
                                    <button
                                        type="button"
                                        onClick={handleClickUpload}
                                        className="createProductModalContainer__createProductModal__propsContainer__propProductImage__galeryImages__btnAddImageLoadingCount__btn"
                                        >
                                        Agregar Imágenes
                                    </button>
                                    <p className="createProductModalContainer__createProductModal__propsContainer__propProductImage__galeryImages__loadingCount">
                                        {product.images.length}/6 imágen{product.images.length !== 1 ? 'es' : ''} cargada{product.images.length !== 1 ? 's' : ''}.
                                    </p>
                                </div>
                            </div>

                        </div>

                        <div className='createProductModalContainer__createProductModal__propsContainer__propProduct'>

                            <div className='createProductModalContainer__createProductModal__propsContainer__propProduct__label'>Título</div>
                            <div className='createProductModalContainer__createProductModal__propsContainer__propProduct__input'>
                                <input
                                    name='title'
                                    placeholder='Título'
                                    type="text"
                                    value={product.title}
                                    onChange={(e) => setProduct({ ...product, title: e.target.value })}
                                    className="createProductModalContainer__createProductModal__propsContainer__propProduct__input__prop"
                                    required
                                />
                            </div>

                        </div>

                        <div className='createProductModalContainer__createProductModal__propsContainer__propProduct'>

                            <div className='createProductModalContainer__createProductModal__propsContainer__propProduct__label'>Descripción</div>
                            <div className='createProductModalContainer__createProductModal__propsContainer__propProduct__input'>
                                <input
                                    name='description'
                                    placeholder='Descripción'
                                    type="text"
                                    value={product.description}
                                    onChange={(e) => setProduct({ ...product, description: e.target.value })}
                                    className="createProductModalContainer__createProductModal__propsContainer__propProduct__input__prop"
                                    required
                                />
                            </div>

                        </div>

                        
                        {
                            product.camposDinamicos.length == 0 &&
                            <>
                                <div className='createProductModalContainer__createProductModal__propsContainer__propProduct'>

                                    <div className='createProductModalContainer__createProductModal__propsContainer__propProduct__label'>Precio</div>
                                    <div className='createProductModalContainer__createProductModal__propsContainer__propProduct__input'>
                                        <input
                                            name='price'
                                            placeholder='Precio'
                                            type="number"
                                            value={product.price}
                                            onChange={(e) => setProduct({ ...product, price: e.target.value })}
                                            className="createProductModalContainer__createProductModal__propsContainer__propProduct__input__propShort"
                                            required
                                        />
                                    </div>

                                </div>

                                <div className='createProductModalContainer__createProductModal__propsContainer__propProduct'>

                                    <div className='createProductModalContainer__createProductModal__propsContainer__propProduct__label'>Stock</div>
                                    <div className='createProductModalContainer__createProductModal__propsContainer__propProduct__input'>
                                        <input 
                                        name='stock'
                                        placeholder='Stock'
                                        type="number"
                                        min="0"
                                        value={product.stock}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            // Permití '' (campo vacío) o un número positivo (incluido 0)
                                            if (val === '' || parseInt(val) >= 0) {
                                            setProduct({ ...product, stock: val });
                                            }
                                        }}
                                        className="createProductModalContainer__createProductModal__propsContainer__propProduct__input__propShort"
                                        />
                                    </div>

                                </div>
                            </>
                        }

                        <div className='createProductModalContainer__createProductModal__propsContainer__propProduct'>

                            <div className='createProductModalContainer__createProductModal__propsContainer__propProduct__label'>Estado</div>
                            <div className='createProductModalContainer__createProductModal__propsContainer__propProduct__input'>
                                <input
                                    name='state'
                                    placeholder='Estado (ej: nuevo,usado)'
                                    type="text"
                                    value={product.state}
                                    onChange={(e) => setProduct({ ...product, state: e.target.value })}
                                    className="createProductModalContainer__createProductModal__propsContainer__propProduct__input__prop"
                                    required
                                />
                            </div>

                        </div>

                        <div className='createProductModalContainer__createProductModal__propsContainer__propProduct'>

                            <div className='createProductModalContainer__createProductModal__propsContainer__propProduct__label'>Categoría</div>
                            <div className='createProductModalContainer__createProductModal__propsContainer__propProduct__select'>
                                <select
                                    name='category'
                                    value={product.category}
                                    onChange={(e) => setProduct({ ...product, category: e.target.value })}
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

                        {product.camposDinamicos.map((campo, index) => (
                            <div key={index} className='createProductModalContainer__createProductModal__propsContainer__propProduct'>

                                <div className='createProductModalContainer__createProductModal__propsContainer__propProduct__label'>{capitalizeFirstLetter(campo.key)}</div>
                                <div className='createProductModalContainer__createProductModal__propsContainer__propProduct__input'>
                                    <input
                                        name={campo.key}
                                        placeholder={campo.key}
                                        type="text"
                                        value={campo.value}
                                        onChange={(e) => handleValueChange(index, e.target.value)}
                                        className="createProductModalContainer__createProductModal__propsContainer__propProduct__input__prop"
                                        required
                                    />
                                    <button
                                    type="button"
                                    onClick={() => handleEliminarCampo(index)} // Función para eliminar este campo
                                    className="createProductModalContainer__createProductModal__propsContainer__addNewFieldContainer__inputsBtn__btn"
                                    style={{marginLeft:'2vh'}}
                                    >
                                    X
                                    </button>
                                </div>

                            </div>
                        ))}
                        {
                            product.camposDinamicos.length > 0 &&
                            <ul className='createProductModalContainer__createProductModal__propsContainer__variantsContainer'>
                                {
                                    variantes.length > 0 &&
                                    <strong>Variantes:</strong>  
                                }
                                {variantes.map((v, i) => (
                                    <li key={i} style={{ marginBottom: '16px', listStyle: 'none' }}>
                                    <div style={{ marginBottom: '4px' }}>
                                        {/* <strong>Variante:</strong>  */}{Object.entries(v.campos).map(([k, val]) => `${k}: ${val}`).join(' | ')}
                                    </div>

                                    <div style={{ marginBottom: '4px' }}>
                                        <label>
                                        Precio:&nbsp;
                                        <input
                                            type="number"
                                            value={v.price}
                                            onChange={(e) => {
                                                const nuevasVariantes = [...variantes];
                                                nuevasVariantes[i].price = parseInt(e.target.value) || 0;
                                                setVariantes(nuevasVariantes);
                                            }}
                                            style={{ width: '80px', textAlign: 'center' }}
                                        />
                                        </label>
                                    </div>

                                    <div style={{ marginBottom: '4px' }}>
                                        <label>
                                        Stock:&nbsp;
                                        <input
                                            type="number"
                                            value={v.stock}
                                            onChange={(e) => {
                                                const nuevasVariantes = [...variantes];
                                                nuevasVariantes[i].stock = parseInt(e.target.value) || 0;
                                                setVariantes(nuevasVariantes);
                                            }}
                                            style={{ width: '80px', textAlign: 'center' }}
                                        />
                                        </label>
                                    </div>

                                    <button
                                        onClick={() => {
                                            const nuevasVariantes = [...variantes];
                                            nuevasVariantes.splice(i, 1);
                                            setVariantes(nuevasVariantes);
                                        }}
                                        style={{
                                        marginTop: '4px',
                                        color: 'white',
                                        background: 'red',
                                        border: 'none',
                                        padding: '4px 8px',
                                        cursor: 'pointer',
                                        }}
                                    >
                                        Eliminar
                                    </button>
                                    </li>
                                ))}
                            </ul>
                        }

                        <div className='createProductModalContainer__createProductModal__propsContainer__addNewFieldContainer'>

                            <div className="createProductModalContainer__createProductModal__propsContainer__addNewFieldContainer__label">Agregar nuevo campo</div>
                            <div className="createProductModalContainer__createProductModal__propsContainer__addNewFieldContainer__inputsBtn">
                                <input
                                    type="text"
                                    name="key"
                                    placeholder="Nombre del campo (ej: color)"
                                    value={nuevoCampo.key}
                                    onChange={handleChangeNuevoCampo}
                                    className="createProductModalContainer__createProductModal__propsContainer__addNewFieldContainer__inputsBtn__input"
                                />
                                <input
                                    type="text"
                                    name="value"
                                    placeholder="Valor/es (ej: rojo,negro)"
                                    value={nuevoCampo.value}
                                    onChange={handleChangeNuevoCampo}
                                    className="createProductModalContainer__createProductModal__propsContainer__addNewFieldContainer__inputsBtn__input"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddCampo}
                                    className="createProductModalContainer__createProductModal__propsContainer__addNewFieldContainer__inputsBtn__btn"
                                >
                                    +
                                </button>
                            </div>

                        </div>
                        {
                            product.camposDinamicos.length > 0 &&

                            <div className='createProductModalContainer__createProductModal__propsContainer__addVariantsContainer'>

                                <div className="createProductModalContainer__createProductModal__propsContainer__addVariantsContainer__title">Agregar variante</div>

                                
                                {
                                    product.camposDinamicos.map((campo, index) => {
                                        const atributo = campo.key;

                                        // Evitar repetir selects para atributos duplicados
                                        if (product.camposDinamicos.findIndex(c => c.key === atributo) !== index) return null;

                                        const opciones = campo.value.split(',').map(op => op.trim());

                                        return (
                                        <div key={atributo} className='createProductModalContainer__createProductModal__propsContainer__addVariantsContainer__formVariants'>
                                            <div>{atributo}</div>
                                            <select
                                                className='createProductModalContainer__createProductModal__propsContainer__addVariantsContainer__formVariants__input'
                                                value={nuevaVariante.campos[atributo] || ''}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    setNuevaVariante(prev => ({
                                                    ...prev,
                                                    campos: { ...prev.campos, [atributo]: value }
                                                    }));
                                                }}
                                                >
                                                <option value="" disabled>{`Seleccionar ${atributo}`}</option>
                                                {
                                                    opciones.map((opcion, i) => (
                                                    <option key={i} value={opcion}>{opcion}</option>
                                                    ))
                                                }
                                            </select>
                                        </div>
                                        );
                                    })
                                }
                                <div className='createProductModalContainer__createProductModal__propsContainer__addVariantsContainer__labelInput'>
                                    <div className='createProductModalContainer__createProductModal__propsContainer__addVariantsContainer__labelInput__label'>precio</div>
                                    <input
                                    className='createProductModalContainer__createProductModal__propsContainer__addVariantsContainer__labelInput__input'
                                    type="number"
                                    placeholder="Precio"
                                    value={nuevaVariante.price}
                                    onChange={(e) => setNuevaVariante({ ...nuevaVariante, price: parseInt(e.target.value) || '' })}
                                    />
                                </div>
                                <div className='createProductModalContainer__createProductModal__propsContainer__addVariantsContainer__labelInput'>
                                    <div className='createProductModalContainer__createProductModal__propsContainer__addVariantsContainer__labelInput__label'>stock</div>
                                    <input
                                    className='createProductModalContainer__createProductModal__propsContainer__addVariantsContainer__labelInput__input'
                                    type="number"
                                    placeholder="Stock"
                                    value={nuevaVariante.stock}
                                    //onChange={(e) => setNuevaVariante({ ...nuevaVariante, stock: parseInt(e.target.value) || '' })}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        const parsed = parseInt(value, 10);
                                        setNuevaVariante({
                                            ...nuevaVariante,
                                            stock: value === '' ? '' : isNaN(parsed) ? '' : Math.max(0, parsed)
                                        });
                                        }}
                                    />
                                </div>

                                <div className='createProductModalContainer__createProductModal__propsContainer__addVariantsContainer__btn'>
                                    <button 
                                        className='createProductModalContainer__createProductModal__propsContainer__addVariantsContainer__btn__prop' 
                                        onClick={handleBtnAddVariant}
                                    >
                                    Agregar Variante
                                    </button>
                                </div>


                            </div>
                        }


                    </div>
                    
                    <div className='createProductModalContainer__createProductModal__propsContainer__btnContainer'>
                        <button /* disabled={loading} */ onClick={handleSubmit} className='createProductModalContainer__createProductModal__propsContainer__btnContainer__btn'>
                            {loading ? (
                                <>
                                    Guardando <Spinner />
                                </>
                            ) : (
                                'Guardar'
                            )}
                        </button>
                    </div>

                </div>
                
            </div>       
        
        </>

    )

}

export default CreateProductModal