import React, {useState} from 'react'
import { toast } from 'react-toastify';
import Spinner from './Spinner';

const ConfirmationBtnConfirmSaleModal = ({inputDiscount,paymentMethod,invoiceType,saleDate,seller,notes,buyerData,setCreateSaleModal,setShowConfirmationBtnConfirmSaleModal,addedProducts,selectedBranchId,setAddedProducts,fetchTickets,billingInfo,showLabelDiscountApplied,totalWithDiscount,total,user,selectedDate}) => {
    const [loading, setLoading] = useState(false);
    const SERVER_URL = import.meta.env.VITE_API_URL;
    const discountPercentage = showLabelDiscountApplied ? Number(inputDiscount) : 0;
    const discountAmount = showLabelDiscountApplied ? (total - totalWithDiscount) : 0;

    const handleBtnConfirmSale = async () => {
        // ✅ Verificación previa de stock
        for (let product of addedProducts) {
            const camposSeleccionados = product.camposSeleccionados || {};

            const varianteSeleccionada = product.variantes?.find(v =>
                Object.entries(camposSeleccionados).every(
                    ([key, val]) => v.campos[key] === val
                )
            );

            const stockDisponible = varianteSeleccionada?.stock ?? product.stock;

            if (product.quantity > stockDisponible) {
                    toast(`No hay suficiente stock para ${product.title} (${Object.entries(camposSeleccionados).map(([key, val]) => `${key}: ${val}`).join(', ') || 'sin variante'})`, {
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
                return; // 👈 evita continuar con la venta
            }
        }
        
        // 2️⃣ Obtener la sucursal seleccionada
        const branch = billingInfo.branches.find(b => b._id === selectedBranchId);
        if (!branch) {
            toast('Sucursal seleccionada no encontrada', {
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
        
        const newTicket = {
            amount: total, // monto original
            finalAmount: showLabelDiscountApplied ? totalWithDiscount : total, 
            discountPercentage,
            discountAmount,
            payer_email: user.email,
            items: addedProducts,
            deliveryMethod: 'vendedor',
            purchase_datetime:  new Date(),
            user_role: user.role,
            branchId: branch._id.toString(),
            purchaserData: {
                name: buyerData.name,
                dni: buyerData.dni,
                phone: buyerData.phone,
                email: buyerData.email,
            }, 
            paymentMethod,
            invoiceType, 
            seller, 
            notes  
        }
        try {
            setLoading(true)
            const response = await fetch(`${SERVER_URL}api/tickets/save-admin-sale`, {
                method: 'POST',         
                credentials: 'include', // 👈 necesario para recibir cookies
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newTicket)
            })
            const data = await response.json();
            if (response.ok) {
                toast('Has registrado la venta con éxito!', {
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
                setTimeout(() => {
                    setShowConfirmationBtnConfirmSaleModal(false)
                    setCreateSaleModal(false)
                    setAddedProducts([])
                    fetchTickets(1, "", "", selectedDate);
                }, 2500);
            } else {
                toast('Ha ocurrido un error, intente nuevamente!', {
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
                setLoading(false)
            }
        } catch (error) {
            console.error('Error:', error);
            setLoading(false)
        }
    }

  return (
    <>

        <div className='confirmationDeleteModalContainer'>

            <div className='confirmationDeleteModalContainer__confirmationModal'>

                <div className='confirmationDeleteModalContainer__confirmationModal__btnCloseModal'>
                    <div onClick={()=>setShowConfirmationBtnConfirmSaleModal(false)} className='confirmationDeleteModalContainer__confirmationModal__btnCloseModal__btn'>X</div>
                </div>
                
                <div className='confirmationDeleteModalContainer__confirmationModal__title'>
                    <div className='confirmationDeleteModalContainer__confirmationModal__title__prop'>¿Estás seguro que deseas confirmar la venta?</div>
                </div>

                <div className='confirmationDeleteModalContainer__confirmationModal__btnContainer'>
                    {loading ? (
                        <button
                        disabled
                        className='confirmationDeleteModalContainer__confirmationModal__btnContainer__btn'
                        >
                        <Spinner/>
                        </button>
                    ) : (
                        <button
                        onClick={handleBtnConfirmSale}
                        className='confirmationDeleteModalContainer__confirmationModal__btnContainer__btn'
                        >
                        Si
                        </button>
                    )}
                    <button onClick={()=>setShowConfirmationBtnConfirmSaleModal(false)} className='confirmationDeleteModalContainer__confirmationModal__btnContainer__btn'>No</button>
                </div>

            </div>
    
        </div>
    </>
  )
}

export default ConfirmationBtnConfirmSaleModal