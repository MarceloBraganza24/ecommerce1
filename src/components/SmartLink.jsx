import { useLocation, Link } from 'react-router-dom';

const SmartLink = ({ to, children, ...props }) => {
    const location = useLocation();

    const handleClick = () => {
        if (location.pathname === to) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <Link to={to} onClick={handleClick} {...props}>
            {children}
        </Link>
    );
};

export default SmartLink;
