const bar = document.getElementById('bar');
const nav = document.getElementById('navbar');
const close = document.getElementById('close');

function addToCart(event, proDiv) {
    if (event) {
        if (event._addToCartHandled) return;
        event.preventDefault();
        event.stopPropagation();
        event._addToCartHandled = true;
    }

    const id = proDiv.dataset.id;
    const name = proDiv.dataset.name;
    const price = parseInt(proDiv.dataset.price, 10) || 0;
    const img = proDiv.dataset.img;
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existing = cart.find(item => item.id === id);

    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ id, name, price, img, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    animateAddToCart(proDiv);
}

function animateAddToCart(proDiv) {
    const imgElement = proDiv.querySelector('img');
    const cartIcon = getVisibleCartIcon();
    if (!imgElement || !cartIcon) return;

    const imgRect = imgElement.getBoundingClientRect();
    const cartRect = cartIcon.getBoundingClientRect();
    const clone = imgElement.cloneNode(true);

    clone.style.position = 'fixed';
    clone.style.top = imgRect.top + 'px';
    clone.style.left = imgRect.left + 'px';
    clone.style.width = imgRect.width + 'px';
    clone.style.height = imgRect.height + 'px';
    clone.style.zIndex = '1000';
    clone.style.transition = 'all 0.8s ease-in-out';
    clone.style.borderRadius = '10%';
    clone.style.objectFit = 'cover';

    document.body.appendChild(clone);

    setTimeout(() => {
        clone.style.top = cartRect.top + 'px';
        clone.style.left = cartRect.left + 'px';
        clone.style.width = '30px';
        clone.style.height = '30px';
        clone.style.opacity = '0.5';
    }, 10);

    setTimeout(() => {
        document.body.removeChild(clone);
    }, 810);
}

function getVisibleCartIcon() {
    const icons = Array.from(document.querySelectorAll('#cart-icon-mobile, #cart-icon'));
    return icons.find(icon => {
        const rect = icon.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
    }) || icons[0];
}

function formatPrice(price) {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function renderCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const tbody = document.getElementById('cart-body');
    if (!tbody) return;

    tbody.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><a href="#" class="remove-cart-item" data-id="${item.id}"><i class="far fa-times-circle"></i></a></td>
            <td><img src="${item.img}" alt="${item.name}"></td>
            <td>${item.name}</td>
            <td>${formatPrice(item.price)} VND</td>
            <td>
                <div class="quantity-control">
                    <button type="button" class="quantity-decrease" data-id="${item.id}">−</button>
                    <input type="number" min="1" value="${item.quantity}" class="cart-quantity" data-id="${item.id}">
                    <button type="button" class="quantity-increase" data-id="${item.id}">+</button>
                </div>
            </td>
            <td>${formatPrice(item.price * item.quantity)} VND</td>
        `;
        tbody.appendChild(row);
        total += item.price * item.quantity;
    });

    const subtotalTableBody = document.querySelector('#subtotal table tbody');
    if (subtotalTableBody) {
        const discount = parseFloat(localStorage.getItem('checkoutDiscount')) || 0;
        const shipping = 30000;
        const finalTotal = total + shipping - discount;

        // Update subtotal
        const subtotalRow = subtotalTableBody.querySelector('tr:first-child td:last-child');
        if (subtotalRow) {
            subtotalRow.textContent = formatPrice(total) + ' VND';
        }

        // Add or update discount row
        let discountRow = subtotalTableBody.querySelector('.discount-row');
        if (discount > 0) {
            if (!discountRow) {
                discountRow = document.createElement('tr');
                discountRow.className = 'discount-row';
                discountRow.innerHTML = `
                    <td>Giảm giá</td>
                    <td>-${formatPrice(discount)} VND</td>
                `;
                // Insert after subtotal row
                const shippingRow = subtotalTableBody.querySelector('tr:nth-child(2)');
                if (shippingRow) {
                    shippingRow.insertAdjacentElement('afterend', discountRow);
                }
            } else {
                discountRow.querySelector('td:last-child').textContent = `-${formatPrice(discount)} VND`;
            }
        } else if (discountRow) {
            discountRow.remove();
        }

        // Update final total
        const totalRow = subtotalTableBody.querySelector('tr:last-child td:last-child');
        if (totalRow) {
            totalRow.innerHTML = '<strong>' + formatPrice(finalTotal) + ' VND</strong>';
        }
    }

    const totalPriceEl = document.getElementById('total-price');
    const grandTotalEl = document.getElementById('grand-total');
    if (totalPriceEl) {
        totalPriceEl.textContent = formatPrice(total) + ' VND';
    }
    if (grandTotalEl) {
        grandTotalEl.textContent = formatPrice(finalTotal) + ' VND';
    }
}

function removeFromCart(id) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(item => item.id !== id);
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
}

function updateQuantity(id, qty) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const item = cart.find(item => item.id === id);
    if (item) {
        item.quantity = parseInt(qty, 10) || 0;
        if (item.quantity <= 0) {
            cart = cart.filter(i => i.id !== id);
        }
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
}

function getQueryParam(name) {
    return new URLSearchParams(window.location.search).get(name);
}

function getDefaultProductShots(id) {
    switch (id) {
        case '1': return ['img/products/3.1.png', 'img/products/3.1a.jpg', 'img/products/3.1b.png', 'img/products/everyday wonderland.jpeg'];
        case '2': return ['img/products/3.2.jpg', 'img/products/3.2a.jpeg', 'img/products/3.2b.jpg', 'img/products/the ancient castle.jpg'];
        case '3': return ['img/products/3.3.jpg', 'img/products/3.3a.jpg', 'img/products/3.3b.jpg', 'img/products/the mare of animals.jpg'];
        case '4': return ['img/products/3.4.jpg', 'img/products/3.4a.webp', 'img/products/3.4b.png', 'img/products/3.4c.jpg'];
        case '5': return ['img/products/3.5.png', 'img/products/3.5a.png', 'img/products/3.5b.png', 'img/products/shelter.jpeg'];
        case '6': return ['img/products/3.6.png', 'img/products/3.6a.png', 'img/products/3.6b.jpg', 'img/products/reshape.jpeg'];
        case '7': return ['img/products/3.7.jpg', 'img/products/3.7a.avif', 'img/products/3.7b.webp', 'img/products/mime.jpg'];
        case '8': return ['img/products/3.8.png', 'img/products/3.8a.png', 'img/products/3.8b.jpg', 'img/products/the other one.jpg'];
        case '9': return ['img/products/5.1.png', 'img/products/5.1a.jpg', 'img/products/5.1b.jpg', 'img/products/the ink plum blossom.jpeg'];
        case '10': return ['img/products/5.2.png', 'img/products/5.2a.webp', 'img/products/5.2b.png', 'img/products/the mirage.jpeg'];
        case '11': return ['img/products/5.3.jpg', 'img/products/5.3a.webp', 'img/products/5.3b.jpg', 'img/products/the sound.jpeg'];
        case '12': return ['img/products/5.4.png', 'img/products/5.4a.png', 'img/products/5.4b.jpg', 'img/products/5.4c.png'];
        case '13': return ['img/products/5.5.png', 'img/products/5.5a.png', 'img/products/5.5b.avif', 'img/products/le petit prince.jpeg'];
        case '14': return ['img/products/5.6.png', 'img/products/5.6a.webp', 'img/products/5.6b.png', 'img/products/monster carnival.jpg'];
        case '15': return ['img/products/5.7.png', 'img/products/5.7a.jpg', 'img/products/5.7b.jpg', 'img/products/echo.jpg'];
        case '16': return ['img/products/5.8.png', 'img/products/5.8a.png', 'img/products/5.8b.jpg', 'img/products/living wild-fight for joy.jpg'];
        default: return ['img/products/3.1.png', 'img/products/3.2.jpg', 'img/products/3.3.jpg', 'img/products/3.4.jpg'];
    }
}

function loadProductDetails() {
    const id = getQueryParam('id') || '1';
    const name = getQueryParam('name') || 'Thời Trang Nam Áo Thun';
    const price = getQueryParam('price') || '100';
    const series = getQueryParam('series') || 'T-Shirt';
    const description = getQueryParam('description') || 'T-Shirt chất liệu coton toáng mát';
    const img1 = getQueryParam('img') || getDefaultProductShots(id)[0];
    const shots = [
        img1,
        getQueryParam('img2'),
        getQueryParam('img3'),
        getQueryParam('img4')
    ].map(img => img || null);

    const fallbackShots = getDefaultProductShots(id);
    if (!shots[1] && !shots[2] && !shots[3]) {
        shots[1] = fallbackShots[1];
        shots[2] = fallbackShots[2];
        shots[3] = fallbackShots[3];
    }

    const breadcrumb = document.getElementById('breadcrumb');
    const productTitle = document.getElementById('product-title');
    const productPrice = document.getElementById('product-price');
    const productDescription = document.getElementById('product-description');
    const mainImg = document.getElementById('MainImg');
    const smallImgs = Array.from(document.getElementsByClassName('small-img'));

    if (breadcrumb) breadcrumb.textContent = 'Home / ' + series;
    if (productTitle) productTitle.textContent = name;
    if (productPrice) productPrice.textContent = formatPrice(price) + ' VND';
    if (productDescription) productDescription.textContent = description;
    if (mainImg) {
        mainImg.src = shots[0] || fallbackShots[0];
        mainImg.style.opacity = '1';
    }
    document.title = name + ' - Bóc Móc';

    smallImgs.forEach((imgElem, index) => {
        const src = shots[index] || fallbackShots[index];
        imgElem.src = src;
        imgElem.onclick = () => {
            if (mainImg && mainImg.src !== src) {
                const nextImg = document.getElementById('NextImg');
                nextImg.src = src;
                nextImg.onload = () => {
                    mainImg.style.opacity = '0';
                    nextImg.style.opacity = '1';
                    setTimeout(() => {
                        mainImg.src = src;
                        mainImg.style.opacity = '1';
                        nextImg.style.opacity = '0';
                    }, 300);
                };
            }
        };
    });
}

function addToCartDetail() {
    const id = getQueryParam('id') || String(Date.now());
    const name = document.getElementById('product-title')?.textContent || 'Unknown Product';
    const priceText = getQueryParam('price') || document.getElementById('product-price')?.textContent || '0';
    const price = parseInt(priceText.replace(/\D/g, ''), 10) || 0;
    const img = document.getElementById('MainImg')?.src || '';
    const quantityInput = document.getElementById('product-quantity');
    const quantity = parseInt(quantityInput?.value || '1', 10) || 1;
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existing = cart.find(item => item.id === id);

    if (existing) {
        existing.quantity += quantity;
    } else {
        cart.push({ id, name, price, img, quantity });
    }

    localStorage.setItem('cart', JSON.stringify(cart));

    // Add animation
    const mainImg = document.getElementById('MainImg');
    if (mainImg) {
        animateAddToCart({ querySelector: () => mainImg });
    }
}

function initShopPagination() {
    const products = Array.from(document.querySelectorAll('.pro-container .pro'));
    if (!products.length) return;

    const pageSize = 8;
    products.forEach((pro, index) => {
        pro.dataset.page = index < pageSize ? '1' : '2';
    });

    const pagination = document.getElementById('pagination');
    const pageLinks = pagination ? Array.from(pagination.querySelectorAll('a')) : [];

    function setActivePage(page) {
        products.forEach(pro => {
            pro.style.display = pro.dataset.page === page ? '' : 'none';
        });

        pageLinks.forEach(link => {
            if (link.dataset.page === page) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    if (pagination) {
        pagination.addEventListener('click', function (event) {
            const link = event.target.closest('a');
            if (!link) return;
            event.preventDefault();
            const page = link.dataset.page;
            if (page === 'next') {
                const current = pageLinks.find(l => l.classList.contains('active'));
                const nextPage = current && current.dataset.page === '1' ? '2' : '1';
                setActivePage(nextPage);
            } else if (page) {
                setActivePage(page);
            }
        });
    }

    setActivePage('1');
}

function initShopProductLinks() {
    const products = document.querySelectorAll('.pro-container .pro');
    products.forEach(pro => {
        const cartLink = pro.querySelector('a');
        if (cartLink) {
            cartLink.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                addToCart(event, pro);
            });
        }

        pro.addEventListener('click', function (event) {
            if (event.target.closest('a')) return;
            const name = pro.dataset.name || '';
            const price = pro.dataset.price || '';
            const series = pro.querySelector('.des span')?.textContent || '';
            const img = pro.querySelector('img')?.getAttribute('src') || '';
            const description = pro.dataset.description || '';
            const params = new URLSearchParams({
                id: pro.dataset.id || '',
                name,
                price,
                series,
                img,
                description
            });
            window.location.href = 'sproduct.html?' + params.toString();
        });
    });
}

function initProductDetailPage() {
    if (!document.getElementById('MainImg')) return;
    loadProductDetails();

    const addButton = document.getElementById('add-to-cart-detail');
    if (addButton) {
        addButton.addEventListener('click', function (event) {
            event.preventDefault();
            addToCartDetail();
        });
    }
}

// Blog Detail Functions
function loadBlogDetail() {
    const blogId = getQueryParam('id') || '1';
    const blogData = getBlogData(blogId);

    if (blogData) {
        document.getElementById('blog-title').textContent = blogData.title + ' - Bóc Móc';
        document.getElementById('blog-detail-title').textContent = blogData.title;
        document.getElementById('blog-main-image').src = blogData.image;
        document.getElementById('blog-main-image').alt = blogData.title;
        document.getElementById('blog-date').textContent = blogData.date;
        document.getElementById('blog-category').textContent = blogData.category;
        document.getElementById('blog-heading').textContent = blogData.title;
        document.getElementById('blog-content').innerHTML = blogData.content;
    }
}

function getBlogData(id) {
    const blogs = {
        '1': {
            title: 'Hirono Bear Vinyl Plush Doll',
            date: '13/01/2024',
            category: 'Hirono Series',
            image: 'img/blog/Hirono Bear Vinyl Plush Doll .png',
            content: `
                <p><strong>Giới thiệu về Hirono Bear Vinyl Plush Doll</strong></p>
                <p>Hirono Bear Vinyl Plush Doll là một trong những sản phẩm nổi bật nhất trong series Hirono của POP MART. Với thiết kế dễ thương và chất liệu vinyl cao cấp, chú gấu Hirono mang đến sự kết hợp hoàn hảo giữa phong cách vintage và hiện đại.</p>

                <p><strong>Đặc điểm nổi bật:</strong></p>
                <ul>
                    <li>Chất liệu vinyl cao cấp, an toàn cho sức khỏe</li>
                    <li>Thiết kế 3D với độ chi tiết cao</li>
                    <li>Kích thước: 25cm</li>
                    <li>Màu sắc: Trắng hồng với chi tiết màu hồng pastel</li>
                </ul>

                <p><strong>Lý do nên sở hữu:</strong></p>
                <p>Hirono Bear không chỉ là một món đồ chơi mà còn là một tác phẩm nghệ thuật. Với thiết kế tinh tế và ý nghĩa sâu sắc, chú gấu này sẽ là người bạn đồng hành hoàn hảo cho những ai yêu thích văn hóa Nhật Bản và nghệ thuật POP MART.</p>

                <p><strong>Giá cả và tính sẵn có:</strong></p>
                <p>Hirono Bear Vinyl Plush Doll có giá 280.000 VND. Sản phẩm có số lượng hạn chế, hãy nhanh tay sở hữu trước khi hết hàng!</p>
            `
        },
        '2': {
            title: 'Hirono Monsters\' Carnival Series Figures',
            date: '26/01/2024',
            category: 'Hirono Series',
            image: 'img/blog/Hirono Monsters’ Carnival Series Figures.png',
            content: `
                <p><strong>Khám phá thế giới Monsters' Carnival</strong></p>
                <p>Hirono Monsters' Carnival Series Figures mang đến một thế giới kỳ ảo với những nhân vật quái vật dễ thương. Series này lấy cảm hứng từ lễ hội carnival với màu sắc rực rỡ và thiết kế vui nhộn.</p>

                <p><strong>Các nhân vật trong series:</strong></p>
                <ul>
                    <li><strong>Clown Monster:</strong> Nhân vật hề với nụ cười bí ẩn</li>
                    <li><strong>Lion Tamer:</strong> Người huấn luyện sư tử với trang phục rực rỡ</li>
                    <li><strong>Acrobat:</strong> Người nghệ sĩ xiếc với khả năng nhào lộn</li>
                    <li><strong>Ringmaster:</strong> Người chỉ huy carnival với cây gậy quyền uy</li>
                </ul>

                <p><strong>Ý nghĩa của series:</strong></p>
                <p>Series này không chỉ mang tính giải trí mà còn gửi gắm thông điệp về việc đón nhận sự khác biệt. Mỗi nhân vật quái vật đều có câu chuyện riêng, dạy chúng ta rằng vẻ bề ngoài không quan trọng bằng trái tim và tâm hồn.</p>

                <p><strong>Thông tin sản phẩm:</strong></p>
                <p>Giá: 300.000 VND<br>
                Kích thước: 10-15cm<br>
                Chất liệu: PVC cao cấp<br>
                Số lượng: 4 nhân vật trong series</p>
            `
        },
        '3': {
            title: 'Hirono Shelter Series Figures',
            date: '12/02/2024',
            category: 'Hirono Series',
            image: 'img/blog/Hirono Shelter Series Figures.png',
            content: `
                <p><strong>Shelter Series: Nơi trú ẩn của tâm hồn</strong></p>
                <p>Hirono Shelter Series Figures kể về câu chuyện của những chú chim tìm kiếm mái ấm. Series này mang đến thông điệp sâu sắc về việc tìm kiếm sự bình yên và thuộc về trong cuộc sống bận rộn.</p>

                <p><strong>Các chủ đề trong series:</strong></p>
                <ul>
                    <li><strong>Birdcage:</strong> Lồng chim - biểu tượng cho sự giam cầm và khao khát tự do</li>
                    <li><strong>Circus:</strong> Rạp xiếc - nơi những chú chim biểu diễn để kiếm sống</li>
                    <li><strong>Poet:</strong> Nhà thơ - chú chim với cây bút và trang giấy</li>
                    <li><strong>Musician:</strong> Nhạc sĩ - chú chim với cây đàn và nốt nhạc</li>
                </ul>

                <p><strong>Thông điệp nghệ thuật:</strong></p>
                <p>Mỗi nhân vật trong Shelter Series đều mang một câu chuyện riêng. Series này khuyến khích chúng ta suy nghĩ về sự tự do, về việc tìm kiếm ý nghĩa trong cuộc sống, và về cách chúng ta xây dựng "mái ấm" cho tâm hồn mình.</p>

                <p><strong>Chi tiết sản phẩm:</strong></p>
                <p>Giá: 280.000 VND<br>
                Kích thước: 8-12cm<br>
                Chất liệu: Ceramic và PVC kết hợp<br>
                Số lượng: 4 nhân vật trong series</p>
            `
        },
        '4': {
            title: 'SKULLPANDA Lazy Panda Plush Doll Pendant',
            date: '27/02/2024',
            category: 'SKULLPANDA Series',
            image: 'img/blog/SKULLPANDA Lazy Panda Plush Doll Pendant.png',
            content: `
                <p><strong>Gặp gỡ chú gấu trúc lười biếng</strong></p>
                <p>SKULLPANDA Lazy Panda Plush Doll Pendant là sự kết hợp hoàn hảo giữa phong cách SKULLPANDA đặc trưng và thiết kế plush doll đáng yêu. Chú gấu trúc này mang đến thông điệp về việc trân trọng những khoảnh khắc nghỉ ngơi.</p>

                <p><strong>Đặc điểm thiết kế:</strong></p>
                <ul>
                    <li>Mặt nạ sọ người đặc trưng của SKULLPANDA</li>
                    <li>Lông plush mềm mại với màu đen trắng cổ điển</li>
                    <li>Dây chuyền có thể tháo rời</li>
                    <li>Kích thước: 8cm (không bao gồm dây)</li>
                </ul>

                <p><strong>Ý nghĩa của Lazy Panda:</strong></p>
                <p>Trong xã hội hiện đại với nhịp sống hối hả, Lazy Panda nhắc nhở chúng ta về việc nghỉ ngơi. "Lười biếng" đôi khi là cách để nạp năng lượng, để suy nghĩ sâu sắc hơn về cuộc sống. Chú gấu trúc này khuyến khích sự cân bằng giữa làm việc và nghỉ ngơi.</p>

                <p><strong>Cách sử dụng:</strong></p>
                <p>Có thể đeo như dây chuyền, hoặc đặt trên bàn làm việc như một món đồ decor dễ thương. Lazy Panda cũng rất phù hợp để tặng người thân yêu trong những dịp đặc biệt.</p>

                <p><strong>Thông tin mua hàng:</strong></p>
                <p>Giá: 280.000 VND<br>
                Chất liệu: Plush cao cấp<br>
                Xuất xứ: Việt Nam</p>
            `
        },
        '5': {
            title: 'SKULLPANDA L’impressionnisme Series Plush Doll',
            date: '02/03/2024',
            category: 'SKULLPANDA Series',
            image: 'SKULLPANDA L’impressionnisme Series Plush Doll.png',
            content: `
                <p><strong>Nghệ thuật Ấn tượng qua góc nhìn SKULLPANDA</strong></p>
                <p>SKULLPANDA L'impressionnisme Series Plush Doll là sự kết hợp độc đáo giữa phong cách nghệ thuật Ấn tượng Pháp và thiết kế SKULLPANDA. Series này mang đến cái nhìn mới mẻ về nghệ thuật cổ điển.</p>

                <p><strong>Các tác phẩm trong series:</strong></p>
                <ul>
                    <li><strong>Water Lilies:</strong> Bông sen trên mặt nước với hiệu ứng ánh sáng</li>
                    <li><strong>Haystack:</strong> Đồng cỏ với những bó rơm vàng</li>
                    <li><strong>Poppy Field:</strong> Cánh đồng hoa anh túc rực rỡ</li>
                    <li><strong>Rouen Cathedral:</strong> Nhà thờ Rouen trong nhiều góc nhìn</li>
                </ul>

                <p><strong>Sự kết hợp độc đáo:</strong></p>
                <p>Việc kết hợp nghệ thuật Ấn tượng với mặt nạ sọ người tạo nên một contrast thú vị. Series này khuyến khích người xem suy nghĩ về nghệ thuật, về cách chúng ta cảm nhận và diễn giải thế giới xung quanh.</p>

                <p><strong>Giá trị nghệ thuật:</strong></p>
                <p>Mỗi plush doll trong series đều là một tác phẩm nghệ thuật mini. Chúng không chỉ là đồ chơi mà còn là phương tiện để học hỏi và thưởng thức nghệ thuật Pháp thế kỷ 19.</p>

                <p><strong>Thông số kỹ thuật:</strong></p>
                <p>Giá: 280.000 VND<br>
                Kích thước: 15cm<br>
                Chất liệu: Plush cao cấp với chi tiết PVC<br>
                Số lượng: 4 tác phẩm trong series</p>
            `
        },
        '6': {
            title: 'SKULLPANDA You Found Me! Series Plush Doll Pendant',
            date: '30/03/2024',
            category: 'SKULLPANDA Series',
            image: 'img/blog/SKULLPANDA You Found Me! Series Plush Doll Pendant.png',
            content: `
                <p><strong>"You Found Me!" - Trò chơi tìm kiếm thú vị</strong></p>
                <p>SKULLPANDA You Found Me! Series Plush Doll Pendant mang đến trải nghiệm tương tác độc đáo. Đây là series đầu tiên của SKULLPANDA có yếu tố game, khuyến khích người chơi tham gia vào cuộc tìm kiếm.</p>

                <p><strong>Cơ chế hoạt động:</strong></p>
                <p>Mỗi plush doll trong series đều "ẩn mình" trong một thiết kế phức tạp. Người chơi cần tìm cách "phát hiện" chú gấu trúc đang ẩn náu. Đây là sự kết hợp giữa nghệ thuật và trí tuệ.</p>

                <p><strong>Các nhân vật:</strong></p>
                <ul>
                    <li><strong>Forest Hider:</strong> Ẩn trong rừng cây</li>
                    <li><strong>Cave Explorer:</strong> Trong hang động bí mật</li>
                    <li><strong>Cloud Drifter:</strong> Trên những đám mây</li>
                    <li><strong>Ocean Diver:</strong> Dưới đáy đại dương</li>
                </ul>

                <p><strong>Ý nghĩa giáo dục:</strong></p>
                <p>Series này không chỉ mang tính giải trí mà còn giúp phát triển khả năng quan sát và tư duy logic. Đây là món quà hoàn hảo cho trẻ em và những ai yêu thích trò chơi trí tuệ.</p>

                <p><strong>Thiết kế đặc biệt:</strong></p>
                <p>Mỗi pendant đều có dây chuyền có thể tháo rời, cho phép sử dụng linh hoạt. Chất liệu plush cao cấp đảm bảo độ bền và an toàn.</p>

                <p><strong>Thông tin sản phẩm:</strong></p>
                <p>Giá: 280.000 VND<br>
                Kích thước: 10cm<br>
                Chất liệu: Plush và PVC kết hợp<br>
                Độ tuổi phù hợp: 8+<br>
                Số lượng: 4 nhân vật trong series</p>
            `
        }
    };

    return blogs[id];
}

function initBlogDetailPage() {
    if (!document.getElementById('blog-main-image')) return;
    loadBlogDetail();
}

// Checkout functionality
function initCheckoutPage() {
    if (!document.getElementById('checkout-form')) return;

    loadCheckoutItems();
    initCouponSystem();
    initCheckoutForm();
}

function initCartCouponSystem() {
    const applyCouponBtn = document.getElementById('cart-apply-coupon');
    const couponInput = document.getElementById('cart-coupon-code');
    const couponMessage = document.getElementById('cart-coupon-message');

    if (!applyCouponBtn) return;

    // Available coupons (same as checkout)
    const coupons = {
        'WELCOME10': { discount: 0.1, type: 'percentage', description: 'Giảm 10% cho đơn hàng đầu tiên' },
        'SAVE20': { discount: 20000, type: 'fixed', description: 'Giảm 20.000đ' },
        'FREESHIP': { discount: 30000, type: 'shipping', description: 'Miễn phí vận chuyển' },
        'POPMART50': { discount: 0.5, type: 'percentage', description: 'Giảm 50% cho khách hàng thân thiết' }
    };

    applyCouponBtn.addEventListener('click', () => {
        const code = couponInput.value.trim().toUpperCase();

        if (!code) {
            showCartCouponMessage('Vui lòng nhập mã giảm giá', 'error');
            return;
        }

        if (coupons[code]) {
            const coupon = coupons[code];
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            let discount = 0;
            if (coupon.type === 'percentage') {
                discount = subtotal * coupon.discount;
            } else if (coupon.type === 'fixed') {
                discount = Math.min(coupon.discount, subtotal);
            } else if (coupon.type === 'shipping') {
                discount = 30000; // Shipping cost
            }

            localStorage.setItem('checkoutDiscount', discount.toString());
            localStorage.setItem('appliedCoupon', code);

            showCartCouponMessage(`Áp dụng thành công: ${coupon.description}`, 'success');
            renderCart(); // Refresh cart display
        } else {
            showCartCouponMessage('Mã giảm giá không hợp lệ', 'error');
            localStorage.removeItem('checkoutDiscount');
            localStorage.removeItem('appliedCoupon');
            renderCart();
        }
    });

    // Load previously applied coupon
    const appliedCoupon = localStorage.getItem('appliedCoupon');
    if (appliedCoupon && coupons[appliedCoupon]) {
        couponInput.value = appliedCoupon;
        // Trigger coupon application
        setTimeout(() => applyCouponBtn.click(), 100);
    }
}

function showCartCouponMessage(message, type) {
    const couponMessage = document.getElementById('cart-coupon-message');
    if (couponMessage) {
        couponMessage.textContent = message;
        couponMessage.className = type;
        setTimeout(() => {
            couponMessage.textContent = '';
            couponMessage.className = '';
        }, 5000);
    }
}

function loadCheckoutItems() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const checkoutItems = document.getElementById('checkout-items');
    const checkoutSubtotal = document.getElementById('checkout-subtotal');
    const checkoutTotal = document.getElementById('checkout-total');

    if (!checkoutItems) return;

    checkoutItems.innerHTML = '';
    let subtotal = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        const imageSrc = item.img || item.image || 'img/products/placeholder.png';

        const itemElement = document.createElement('div');
        itemElement.className = 'checkout-item';
        itemElement.innerHTML = `
            <img src="${imageSrc}" alt="${item.name}">
            <div class="checkout-item-details">
                <h4>${item.name}</h4>
                <p>Số lượng: ${item.quantity}</p>
            </div>
            <div class="checkout-item-price">${formatPrice(itemTotal)}</div>
        `;
        checkoutItems.appendChild(itemElement);
    });

    checkoutSubtotal.textContent = formatPrice(subtotal);
    updateCheckoutTotal(subtotal);
}

function updateCheckoutTotal(subtotal) {
    const discountRow = document.getElementById('discount-row');
    const checkoutDiscount = document.getElementById('checkout-discount');
    const checkoutTotal = document.getElementById('checkout-total');

    const discount = parseFloat(localStorage.getItem('checkoutDiscount')) || 0;
    const shipping = 30000; // Fixed shipping cost
    const total = subtotal + shipping - discount;

    if (discount > 0) {
        discountRow.style.display = 'flex';
        checkoutDiscount.textContent = `-${formatPrice(discount)}`;
    } else {
        discountRow.style.display = 'none';
    }

    checkoutTotal.textContent = formatPrice(total);
}

function initCouponSystem() {
    const applyCouponBtn = document.getElementById('apply-coupon');
    const couponInput = document.getElementById('coupon-code');
    const couponMessage = document.getElementById('coupon-message');

    if (!applyCouponBtn) return;

    // Available coupons
    const coupons = {
        'WELCOME10': { discount: 0.1, type: 'percentage', description: 'Giảm 10% cho đơn hàng đầu tiên' },
        'SAVE20': { discount: 20000, type: 'fixed', description: 'Giảm 20.000đ' },
        'FREESHIP': { discount: 30000, type: 'shipping', description: 'Miễn phí vận chuyển' },
        'POPMART50': { discount: 0.5, type: 'percentage', description: 'Giảm 50% cho khách hàng thân thiết' }
    };

    applyCouponBtn.addEventListener('click', () => {
        const code = couponInput.value.trim().toUpperCase();

        if (!code) {
            showCouponMessage('Vui lòng nhập mã giảm giá', 'error');
            return;
        }

        if (coupons[code]) {
            const coupon = coupons[code];
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            let discount = 0;
            if (coupon.type === 'percentage') {
                discount = subtotal * coupon.discount;
            } else if (coupon.type === 'fixed') {
                discount = Math.min(coupon.discount, subtotal);
            } else if (coupon.type === 'shipping') {
                discount = 30000; // Shipping cost
            }

            localStorage.setItem('checkoutDiscount', discount.toString());
            localStorage.setItem('appliedCoupon', code);

            showCouponMessage(`Áp dụng thành công: ${coupon.description}`, 'success');
            loadCheckoutItems(); // Refresh totals
        } else {
            showCouponMessage('Mã giảm giá không hợp lệ', 'error');
            localStorage.removeItem('checkoutDiscount');
            localStorage.removeItem('appliedCoupon');
            loadCheckoutItems();
        }
    });

    // Load previously applied coupon
    const appliedCoupon = localStorage.getItem('appliedCoupon');
    if (appliedCoupon && coupons[appliedCoupon]) {
        couponInput.value = appliedCoupon;
        // Trigger coupon application
        setTimeout(() => applyCouponBtn.click(), 100);
    }
}

function showCouponMessage(message, type) {
    const couponMessage = document.getElementById('coupon-message');
    if (couponMessage) {
        couponMessage.textContent = message;
        couponMessage.className = type;
        setTimeout(() => {
            couponMessage.textContent = '';
            couponMessage.className = '';
        }, 5000);
    }
}

function initCheckoutForm() {
    const form = document.getElementById('checkout-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        if (!validateCheckoutForm()) {
            return;
        }

        // Show loading state
        const submitBtn = form.querySelector('.checkout-btn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Đang xử lý...';
        submitBtn.disabled = true;

        // Simulate order processing
        setTimeout(() => {
            processOrder();
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }, 2000);
    });
}

function validateCheckoutForm() {
    const requiredFields = ['fullName', 'phone', 'email', 'address', 'district', 'city'];
    let isValid = true;

    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field && !field.value.trim()) {
            field.style.borderColor = '#dc3545';
            isValid = false;
        } else if (field) {
            field.style.borderColor = '#28a745';
        }
    });

    // Email validation
    const email = document.getElementById('email');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && email.value && !emailRegex.test(email.value)) {
        email.style.borderColor = '#dc3545';
        isValid = false;
    }

    // Phone validation
    const phone = document.getElementById('phone');
    const phoneRegex = /^[0-9]{10,11}$/;
    if (phone && phone.value && !phoneRegex.test(phone.value.replace(/\s/g, ''))) {
        phone.style.borderColor = '#dc3545';
        isValid = false;
    }

    // Terms validation
    const terms = document.getElementById('terms');
    if (terms && !terms.checked) {
        alert('Vui lòng đồng ý với Điều khoản & Điều kiện');
        isValid = false;
    }

    if (!isValid) {
        alert('Vui lòng điền đầy đủ thông tin bắt buộc');
    }

    return isValid;
}

function processOrder() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
        alert('Giỏ hàng trống!');
        return;
    }

    // Collect form data
    const orderData = {
        customer: {
            name: document.getElementById('fullName').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value
        },
        shipping: {
            address: document.getElementById('address').value,
            district: document.getElementById('district').value,
            city: document.getElementById('city').value,
            notes: document.getElementById('notes').value
        },
        payment: document.querySelector('input[name="payment"]:checked').value,
        items: cart,
        discount: parseFloat(localStorage.getItem('checkoutDiscount')) || 0,
        coupon: localStorage.getItem('appliedCoupon') || '',
        orderDate: new Date().toISOString(),
        orderNumber: 'BM' + Date.now()
    };

    // Calculate totals
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = 30000;
    const total = subtotal + shipping - orderData.discount;

    orderData.subtotal = subtotal;
    orderData.shipping = shipping;
    orderData.total = total;

    // Save order (in a real app, this would be sent to server)
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(orderData);
    localStorage.setItem('orders', JSON.stringify(orders));

    // Clear cart and discount
    localStorage.removeItem('cart');
    localStorage.removeItem('checkoutDiscount');
    localStorage.removeItem('appliedCoupon');

    // Show success message and redirect
    showOrderSuccess(orderData);
}

function showOrderSuccess(orderData) {
    const successModal = document.createElement('div');
    successModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;

    successModal.innerHTML = `
        <div style="
            background: white;
            padding: 40px;
            border-radius: 15px;
            text-align: center;
            max-width: 500px;
            width: 90%;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        ">
            <i class="fas fa-check-circle" style="font-size: 60px; color: #28a745; margin-bottom: 20px;"></i>
            <h2 style="color: #222; margin-bottom: 15px;">Đặt hàng thành công!</h2>
            <p style="color: #666; margin-bottom: 20px;">Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đã được xử lý thành công.</p>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: left;">
                <p><strong>Mã đơn hàng:</strong> ${orderData.orderNumber}</p>
                <p><strong>Tổng tiền:</strong> ${formatPrice(orderData.total)}</p>
                <p><strong>Phương thức thanh toán:</strong> ${getPaymentMethodName(orderData.payment)}</p>
            </div>
            <p style="color: #666; font-size: 14px; margin-bottom: 20px;">
                Bạn sẽ nhận được email xác nhận đơn hàng trong vài phút tới.
            </p>
            <button onclick="window.location.href='index.html'" style="
                background: #F3E29A;
                color: #222;
                border: none;
                padding: 12px 30px;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                margin-right: 10px;
            ">Về trang chủ</button>
            <button onclick="window.location.href='shop.html'" style="
                background: #6c757d;
                color: white;
                border: none;
                padding: 12px 30px;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
            ">Tiếp tục mua sắm</button>
        </div>
    `;

    document.body.appendChild(successModal);

    // Close modal when clicking outside
    successModal.addEventListener('click', (e) => {
        if (e.target === successModal) {
            document.body.removeChild(successModal);
        }
    });
}

function getPaymentMethodName(method) {
    const methods = {
        'cod': 'Thanh toán khi nhận hàng (COD)',
        'banking': 'Chuyển khoản ngân hàng',
        'card': 'Thẻ tín dụng/ghi nợ',
        'momo': 'Ví điện tử MoMo',
        'zalopay': 'ZaloPay'
    };
    return methods[method] || method;
}

document.addEventListener('DOMContentLoaded', () => {
    if (bar) {
        bar.addEventListener('click', () => nav.classList.add('active'));
    }

    if (close) {
        close.addEventListener('click', () => nav.classList.remove('active'));
    }

    renderCart();
    if (window.location.pathname.includes('shop.html')) {
        initShopPagination();
    }
    
    initShopProductLinks();
    initProductDetailPage();
    initBlogDetailPage();
    initCheckoutPage();
    initCartCouponSystem();

    document.body.addEventListener('click', function (event) {
        const removeButton = event.target.closest('.remove-cart-item');
        if (removeButton) {
            event.preventDefault();
            const id = removeButton.dataset.id;
            if (id) removeFromCart(id);
            return;
        }

        const decreaseButton = event.target.closest('.quantity-decrease');
        const increaseButton = event.target.closest('.quantity-increase');
        if (decreaseButton || increaseButton) {
            event.preventDefault();
            const button = decreaseButton || increaseButton;
            const id = button.dataset.id;
            const quantityInput = document.querySelector(`.cart-quantity[data-id="${id}"]`);
            if (!id || !quantityInput) return;

            const currentValue = parseInt(quantityInput.value, 10) || 1;
            const newValue = decreaseButton ? Math.max(1, currentValue - 1) : currentValue + 1;
            quantityInput.value = newValue;
            updateQuantity(id, newValue);
            return;
        }

        const quantityInput = event.target.closest('.cart-quantity');
        if (quantityInput) {
            const id = quantityInput.dataset.id;
            if (id) updateQuantity(id, quantityInput.value);
        }
    });

    document.body.addEventListener('change', function (event) {
        const quantityInput = event.target.closest('.cart-quantity');
        if (quantityInput) {
            const id = quantityInput.dataset.id;
            if (id) updateQuantity(id, quantityInput.value);
        }
    });
});

