import React, {useState,useRef,useEffect} from 'react'
import { toast } from 'react-toastify';
import Spinner from './Spinner';
import { Link } from 'react-router-dom';

const CreateProductModal = ({setShowCreateProductModal,categories,fetchProducts}) => {
    const [loading, setLoading] = useState(false);
    const [product, setProduct] = useState({
        images: [],
        title: '',
        description: '',
        price: '',
        stock: '',
        state: '',
        category: '',
        camposDinamicos: []
    });
    const [nuevoCampo, setNuevoCampo] = useState({ key: '', value: '' });

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
    };
    

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (
            !product.title.trim() ||
            !product.description.trim() ||
            !product.state.trim() ||
            !product.price || isNaN(product.price) || Number(product.price) <= 0 ||
            !product.stock || isNaN(product.stock) || Number(product.stock) < 0
        ) {
            toast('Debes completar todos los campos correctamente', {
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
    
        const formData = new FormData();
        formData.append('title', product.title);
        formData.append('description', product.description);
        formData.append('price', product.price);
        formData.append('stock', product.stock);
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

    return (

        <>

            <div className='createProductModalContainer'>

                <div className='createProductModalContainer__createProductModal'>

                    <div className='createProductModalContainer__createProductModal__btnCloseModal'>
                        <div onClick={()=>setShowCreateProductModal(false)} className='createProductModalContainer__createProductModal__btnCloseModal__btn'>X</div>
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
                                    value={product.stock}
                                    onChange={(e) => setProduct({ ...product, stock: e.target.value })}
                                    className="createProductModalContainer__createProductModal__propsContainer__propProduct__input__propShort"
                                    required
                                />
                            </div>

                        </div>

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
                                    placeholder="Valor (ej: rojo)"
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

                        <div className='createProductModalContainer__createProductModal__propsContainer__btnContainer'>
                            <button disabled={loading} onClick={handleSubmit} className='createProductModalContainer__createProductModal__propsContainer__btnContainer__btn'>
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
                
            </div>       
        
        </>

    )

}

export default CreateProductModal