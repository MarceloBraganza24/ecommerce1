import {useState,useRef,useEffect} from 'react'

const ItemBinProductModal = ({product,setShowItemBinProductModal,fetchProducts,categories,inputFilteredProducts,selectedField}) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        images: [],
        title: '',
        description: '',
        price: '',
        stock: '',
        state: '',
        category: '',
        camposDinamicos: []
    });
    const [variantes, setVariantes] = useState([]); 
    const SERVER_URL = import.meta.env.VITE_API_URL;

    const fileInputRef = useRef(null);

    useEffect(() => {

        if (product) {
            const imagenesDelBackend = product.images.map((imgPath) => {
                const cleanedPath = imgPath.replace(/\\/g, '/'); // Normaliza la ruta a UNIX style
                return {
                type: 'backend',
                name: cleanedPath.split('/').pop(), // Si necesitás el nombre solo
                url: `${SERVER_URL}${cleanedPath}` // Ruta correcta
                };
            });
      
            setFormData((prev) => ({
                ...prev,
                images: imagenesDelBackend
            }));
            
            const camposExtras = product.camposExtras || {};
            const camposDinamicosArray = Object.entries(camposExtras).map(([key, value]) => ({
                key,
                value
            }));
        
            setFormData({
                title: product.title || '',
                description: product.description || '',
                price: product.price || 0,
                stock: product.stock || 0,
                state: product.state || '',
                category: product.category || '',
                images: imagenesDelBackend || [],
                camposDinamicos: camposDinamicosArray
            });

            setVariantes(product.variantes || []);
        }


    }, [product]);

    const capitalizeFirstLetter = (text) => {
        return text.charAt(0).toUpperCase() + text.slice(1);
    };

    return (

        <>

            <div className='updateProductModalContainer'>

                <div className='updateProductModalContainer__updateProductModal'>

                    <div className='updateProductModalContainer__updateProductModal__btnCloseModal'>
                        <div onClick={()=>setShowItemBinProductModal(false)} className='updateProductModalContainer__updateProductModal__btnCloseModal__btn'>X</div>
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
                                        className="mb-2"
                                        style={{display:'none'}}
                                    />
                                    {formData.images.map((img, index) => (
                                        <div key={index} className="updateProductModalContainer__updateProductModal__propsContainer__propProductImage__galeryImages__galeryBtnMaxImg__imgContainer">
                                            <button
                                                type="button"
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
                                    className="updateProductModalContainer__updateProductModal__propsContainer__propProduct__input__prop"
                                    required
                                />
                            </div>

                        </div>


                        {
                            formData.camposDinamicos.length == 0 &&
                            <>
                                <div className='updateProductModalContainer__updateProductModal__propsContainer__propProduct'>

                                    <div className='updateProductModalContainer__updateProductModal__propsContainer__propProduct__label'>Precio</div>
                                    <div className='updateProductModalContainer__updateProductModal__propsContainer__propProduct__input'>
                                        <input
                                            name='price'
                                            placeholder='Precio'
                                            type="number"
                                            value={formData.price}
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
                                        min="0"
                                        value={formData.stock}
                                        className="updateProductModalContainer__updateProductModal__propsContainer__propProduct__input__propShort"
                                        />
                                    </div>

                                </div>
                            </>
                        }

                        <div className='updateProductModalContainer__updateProductModal__propsContainer__propProduct'>

                            <div className='updateProductModalContainer__updateProductModal__propsContainer__propProduct__label'>Estado</div>
                            <div className='updateProductModalContainer__updateProductModal__propsContainer__propProduct__input'>
                                <input
                                    name='state'
                                    placeholder='Estado (ej: nuevo,usado)'
                                    type="text"
                                    value={formData.state}
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
                                    className="createProductModalContainer__createProductModal__propsContainer__propProduct__select__prop"
                                    required
                                >
                                    <option value="">Selecciona una categoría</option>
                                    {categories?.map((category) => (
                                        <option key={category._id} value={category.name}>
                                            {capitalizeFirstLetter(category.name)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                        </div>

                        {formData.camposDinamicos.map((campo, index) => (
                            <div key={index} className='updateProductModalContainer__updateProductModal__propsContainer__propProduct'>
                                <div className='updateProductModalContainer__updateProductModal__propsContainer__propProduct__label'>
                                {capitalizeFirstLetter(campo.key)}
                                </div>
                                <div className='updateProductModalContainer__updateProductModal__propsContainer__propProduct__input'>
                                <input
                                    placeholder={campo.key}
                                    type="text"
                                    value={campo.value}
                                    className="updateProductModalContainer__updateProductModal__propsContainer__propProduct__input__prop"
                                    required
                                />
                                <button
                                    type="button"
                                    className="updateProductModalContainer__updateProductModal__propsContainer__addNewFieldContainer__inputsBtn__btn"
                                    style={{ marginLeft: '2vh' }}
                                >
                                    X
                                </button>
                                </div>
                            </div>
                        ))}
                        {
                            formData.camposDinamicos.length > 0 &&
                            <ul className='updateProductModalContainer__updateProductModal__propsContainer__variantsContainer'>
                                {
                                    variantes.length > 0 &&
                                    <strong>Variantes:</strong>  
                                }
                                {variantes.map((v, i) => (
                                    <li key={i} style={{ marginBottom: '16px', listStyle: 'none' }}>
                                    <div style={{ marginBottom: '4px' }}>
                                        {Object.entries(v.campos).map(([k, val]) => `${k}: ${val}`).join(' | ')}
                                    </div>

                                    <div style={{ marginBottom: '4px' }}>
                                        <label>
                                        Precio:&nbsp; $&nbsp;
                                        <input
                                            type="number"
                                            value={v.price}
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
                                            style={{ width: '80px', textAlign: 'center' }}
                                        />
                                        </label>
                                    </div>

                                    <button
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

                    </div>

                </div>
                
            </div>       
        
        </>

    )

}

export default ItemBinProductModal