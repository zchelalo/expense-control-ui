import clsx from 'clsx'
import { ChevronsUpDown } from 'lucide-react'
import {
  forwardRef,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Box } from '@/components/atoms/box'
import { FlexBox } from '@/components/atoms/flex-box'
import { InputText } from '@/components/atoms/input-text'
import styles from '@/components/molecules/select/select.module.css'
import { mergeRefs } from '@/utils/refs'

type SearchBy = 'label' | 'value' | 'both'

type SelectOption = {
  label: ReactNode
  value: string
}

interface SelectProps {
  id?: string
  options: SelectOption[]
  value?: string
  onChange?: (value: string) => void
  onSearchTextChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  triggerClassName?: string
  listContainerClassName?: string
  listClassName?: string
  listPosition?: 'above' | 'below'
  renderListItem?: (option: SelectOption) => ReactNode
  searchInput?: boolean
  searchPlaceholder?: string
  searchBy?: SearchBy
}

export const Select = forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      id,
      options,
      value,
      onChange,
      onSearchTextChange,
      placeholder,
      disabled = false,
      triggerClassName,
      listContainerClassName,
      listClassName,
      listPosition = 'below',
      renderListItem,
      searchInput = false,
      searchPlaceholder,
      searchBy = 'label',
    }: SelectProps,
    ref,
  ) => {
    const triggerClassnames = clsx(styles.trigger, triggerClassName)
    const listContainerClassnames = clsx(
      styles.listContainer,
      styles[`listContainer--${listPosition}`],
      listContainerClassName,
    )
    const listClassnames = clsx(styles.list, listClassName)

    const containerRef = useRef<HTMLDivElement>(null)
    const [isSelectOpen, setIsSelectOpen] = useState(false)
    const [searchText, setSearchText] = useState('')

    const handleSearchTextChange = useCallback(
      (value: string) => {
        setSearchText(value)
        onSearchTextChange?.(value)
      },
      [onSearchTextChange],
    )

    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(e.target as Node)
        ) {
          handleSearchTextChange('')
          setIsSelectOpen(false)
        }
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }, [handleSearchTextChange])

    const filteredOptions = useMemo(() => {
      if (!searchText) return options
      const lowerText = searchText.toLowerCase()

      return options.filter((option) => {
        const inLabel = option.label
          ?.toString()
          .toLowerCase()
          .includes(lowerText)
        const inValue = option.value.toLowerCase().includes(lowerText)

        if (searchBy === 'label') return inLabel
        if (searchBy === 'value') return inValue
        if (searchBy === 'both') return inLabel || inValue
        return false
      })
    }, [options, searchText, searchBy])

    const selectedOption = options.find((opt) => opt.value === value)

    return (
      <Box ref={mergeRefs(containerRef, ref)} className={styles.container}>
        <button
          id={id}
          type='button'
          className={triggerClassnames}
          onClick={() => {
            if (isSelectOpen) {
              handleSearchTextChange('')
            }

            setIsSelectOpen(!isSelectOpen)
          }}
          disabled={disabled}
        >
          <span>{selectedOption?.label ?? placeholder}</span>
          <ChevronsUpDown className={styles.icon} />
        </button>
        {isSelectOpen && (
          <FlexBox direction='column' className={listContainerClassnames}>
            {searchInput && (
              <div className={styles.searchInputContainer}>
                <InputText
                  placeholder={searchPlaceholder ?? 'Search...'}
                  className={styles.searchInput}
                  value={searchText}
                  onChange={(e) => handleSearchTextChange(e.target.value)}
                />
              </div>
            )}
            <ul className={listClassnames}>
              {filteredOptions.map((option) => (
                <li
                  key={option.value}
                  className={clsx(
                    styles.listItem,
                    option.value === value && styles['listItem--selected'],
                  )}
                >
                  <button
                    type='button'
                    onClick={() => {
                      onChange?.(option.value)
                      setIsSelectOpen(false)
                      handleSearchTextChange('')
                    }}
                  >
                    {renderListItem ? renderListItem(option) : option.label}
                  </button>
                </li>
              ))}
            </ul>
          </FlexBox>
        )}
      </Box>
    )
  },
)
