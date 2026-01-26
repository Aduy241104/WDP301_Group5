export default function FieldError({ errors, name }) {
    if (!errors?.[name]) return null;
    return <p className="mt-1 text-xs text-rose-600">{ errors[name] }</p>;
}
