const CTA = () => {
    return (
        <section className="text-center py-20 bg-[var(--color-gray-0)]">
            <h2 className="text-4xl font-bold text-[var(--color-gray-900)]">
                Ready to Start Your{" "}
                <span className="text-[var(--color-primary-600)]">
                    Adventure?
                </span>
            </h2>

            <p className="mt-4 text-[var(--color-gray-600)]">
                Join thousands of travelers who are already exploring the world together. Your next
                great adventure awaits.
            </p>

            <button className="mt-8 px-8 py-3 rounded-full bg-[var(--color-primary-600)] text-white hover:bg-[var(--color-primary-700)] hover:scale-105
            active:scale-95 transition-all duration-300">
                Join Rahhal  →
            </button>
        </section>
    );
};

export default CTA;
