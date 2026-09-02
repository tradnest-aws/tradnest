"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { HttpTypes } from "@medusajs/types";

import { IconButton } from "@/components/atoms";
import { HeaderCategoryNavbar } from "@/components/molecules";
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink";
import { CloseIcon, HamburgerMenuIcon } from "@/icons";
import { SELLER_REGISTER_PATH } from "@/lib/helpers/locale-path";
import { useCopy } from "@/lib/i18n/useCopy";

import { MobileCategoryNavbar } from "./components";

export const MobileNavbar = ({
  categories,
  parentCategories,
}: {
  categories: HttpTypes.StoreProductCategory[];
  parentCategories: HttpTypes.StoreProductCategory[];
}) => {
  const t = useCopy();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const closeMenuHandler = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const drawer =
    mounted && isOpen
      ? createPortal(
          <div
            className="fixed inset-0 z-[100] flex h-[100dvh] w-full flex-col bg-[rgb(var(--bg-primary))] text-primary"
            dir="inherit"
            data-testid="mobile-menu-drawer"
          >
            <div
              className="flex items-center justify-between border-b border-primary/10 bg-[rgb(var(--bg-primary))] p-4"
              data-testid="mobile-menu-header"
            >
              <h2 className="heading-md uppercase text-primary">{t.menu}</h2>
              <IconButton
                icon={<CloseIcon size={20} />}
                onClick={() => closeMenuHandler()}
                variant="icon"
                size="small"
                data-testid="mobile-menu-close-button"
              />
            </div>
            <div className="flex-1 overflow-y-auto bg-[rgb(var(--bg-primary))]">
              <HeaderCategoryNavbar
                onClose={closeMenuHandler}
                categories={categories}
                parentCategories={parentCategories}
              />
              <div className="p-4">
                <MobileCategoryNavbar
                  onClose={closeMenuHandler}
                  categories={categories}
                  parentCategories={parentCategories}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2 border-t border-primary/10 bg-[rgb(var(--bg-secondary))] p-4">
              <LocalizedClientLink
                href={SELLER_REGISTER_PATH}
                onClick={closeMenuHandler}
                className="inline-flex items-center justify-center rounded-full bg-action px-4 py-3 label-md font-semibold text-action-on-primary"
              >
                {t.becomeSupplier}
              </LocalizedClientLink>
              <LocalizedClientLink
                href="/login"
                onClick={closeMenuHandler}
                className="inline-flex items-center justify-center rounded-full border border-primary/15 bg-[rgb(var(--bg-primary))] px-4 py-3 label-md font-semibold text-primary"
              >
                {t.login}
              </LocalizedClientLink>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <div className="lg:hidden" data-testid="mobile-navbar">
      <button
        type="button"
        className="flex items-center justify-center p-1"
        onClick={() => setIsOpen(true)}
        aria-label={t.menu}
        data-testid="mobile-menu-toggle"
      >
        <HamburgerMenuIcon />
      </button>
      {drawer}
    </div>
  );
};
